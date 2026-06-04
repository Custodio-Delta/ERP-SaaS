"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function createSaleAction(data: {
  customerId?: string;
  items: Array<{
    productVariationId: string;
    quantity: number;
    unitPrice: number;
  }>;
  status: string; // PAID, PENDING
  paymentMethod?: string;
}) {
  const session = await getSession();
  if (!session || !session.organization) {
    return { error: "Acesso não autorizado." };
  }
  const org = session.organization;

  const totalAmount = data.items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  try {
    const sale = await db.$transaction(async (tx) => {
      // 1. Criar Venda/Pedido
      const newSale = await tx.sale.create({
        data: {
          organizationId: org.id,
          customerId: data.customerId || null,
          userId: session.user.id,
          totalAmount,
          status: data.status,
          paymentMethod: data.paymentMethod || "PIX",
        },
      });

      // 2. Criar itens da venda e processar estoque para cada item
      for (const item of data.items) {
        await tx.saleItem.create({
          data: {
            saleId: newSale.id,
            productVariationId: item.productVariationId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          },
        });

        // Deduz estoque na variação de produto
        await tx.productVariation.update({
          where: { id: item.productVariationId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // Registrar log de inventário
        await tx.inventory.create({
          data: {
            productVariationId: item.productVariationId,
            quantity: -item.quantity,
            type: "OUT",
            notes: `Saída por venda - Pedido ID: ${newSale.id}`,
          },
        });
      }

      // 3. Se estiver paga, lança na movimentação financeira da empresa
      if (data.status === "PAID") {
        await tx.transaction.create({
          data: {
            organizationId: org.id,
            type: "INCOME",
            amount: totalAmount,
            category: "Vendas",
            description: `Receita gerada pela Venda #${newSale.id.substring(0, 8)}`,
            status: "COMPLETED",
          },
        });

        // Gerar Fatura (Invoice) automática
        const count = await tx.invoice.count({ where: { organizationId: org.id } });
        await tx.invoice.create({
          data: {
            organizationId: org.id,
            saleId: newSale.id,
            invoiceNumber: `NF-${new Date().getFullYear()}-${1001 + count}`,
            amount: totalAmount,
            status: "PAID",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
          },
        });
      }

      return newSale;
    });

    // Registra log de auditoria
    await db.activityLog.create({
      data: {
        organizationId: org.id,
        userId: session.user.id,
        action: "VENDA_REALIZADA",
        entityName: "Sale",
        entityId: sale.id,
        details: `Venda registrada no valor de R$ ${totalAmount} (Status: ${data.status})`,
      },
    });

    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/financial");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar venda:", error);
    return { error: "Falha ao registrar venda." };
  }
}

export async function deleteSaleAction(id: string) {
  const session = await getSession();
  if (!session || !session.organization) {
    return { error: "Acesso não autorizado." };
  }
  const org = session.organization;

  try {
    await db.sale.delete({
      where: {
        id,
        organizationId: org.id,
      },
    });

    // Registra log de auditoria
    await db.activityLog.create({
      data: {
        organizationId: org.id,
        userId: session.user.id,
        action: "VENDA_DELETADA",
        entityName: "Sale",
        entityId: id,
        details: `Excluída venda ID ${id}`,
      },
    });

    revalidatePath("/dashboard/sales");
    revalidatePath("/dashboard/financial");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Falha ao excluir venda." };
  }
}
