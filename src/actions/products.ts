"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

import { checkPlanLimit } from "@/lib/plan-limits";

export async function createProductAction(data: {
  name: string;
  description?: string;
  price: number;
  costPrice?: number;
  category?: string;
  stock: number;
}) {
  const session = await getSession();
  if (!session || !session.organization) {
    return { error: "Acesso não autorizado." };
  }
  const org = session.organization;

  // Verifica os limites do plano
  const limitCheck = await checkPlanLimit(org.id, "products");
  if (!limitCheck.allowed) {
    return { error: `Limite do plano atingido: Você já possui ${limitCheck.current} produtos no plano ${limitCheck.planName}. Por favor, faça um upgrade para adicionar mais.` };
  }

  try {
    const product = await db.$transaction(async (tx) => {
      // 1. Criar Produto
      const prod = await tx.product.create({
        data: {
          organizationId: org.id,
          name: data.name,
          sku: `SKU-${data.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
          description: data.description || "",
          price: data.price,
          costPrice: data.costPrice || 0,
          category: data.category || "Geral",
        },
      });

      // 2. Criar Variação Padrão
      const variation = await tx.productVariation.create({
        data: {
          productId: prod.id,
          name: "Padrão",
          sku: `${prod.sku}-STD`,
          price: data.price,
          stock: data.stock,
        },
      });

      // 3. Criar Log de Estoque Inicial
      if (data.stock > 0) {
        await tx.inventory.create({
          data: {
            productVariationId: variation.id,
            quantity: data.stock,
            type: "IN",
            notes: "Saldo inicial de estoque",
          },
        });
      }

      return prod;
    });

    // Registra log de auditoria
    await db.activityLog.create({
      data: {
        organizationId: org.id,
        userId: session.user.id,
        action: "PRODUTO_CADASTRADO",
        entityName: "Product",
        entityId: product.id,
        details: `Cadastrado produto: ${data.name} com ${data.stock} unidades em estoque`,
      },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return { error: "Falha ao registrar produto." };
  }
}

export async function adjustStockAction(data: {
  variationId: string;
  quantity: number; // Positivo para entrada, negativo para saída
  type: string; // IN, OUT, ADJUSTMENT
  notes?: string;
}) {
  const session = await getSession();
  if (!session || !session.organization) {
    return { error: "Acesso não autorizado." };
  }

  try {
    await db.$transaction(async (tx) => {
      // 1. Criar Log de Inventário
      await tx.inventory.create({
        data: {
          productVariationId: data.variationId,
          quantity: data.quantity,
          type: data.type,
          notes: data.notes || "Ajuste manual",
        },
      });

      // 2. Atualizar Estoque na Variação
      await tx.productVariation.update({
        where: { id: data.variationId },
        data: {
          stock: {
            increment: data.quantity,
          },
        },
      });
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao ajustar estoque:", error);
    return { error: "Falha ao ajustar estoque." };
  }
}

export async function deleteProductAction(id: string) {
  const session = await getSession();
  if (!session || !session.organization) {
    return { error: "Acesso não autorizado." };
  }
  const org = session.organization;

  try {
    await db.product.delete({
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
        action: "PRODUTO_DELETADO",
        entityName: "Product",
        entityId: id,
        details: `Excluído produto ID ${id}`,
      },
    });

    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Falha ao deletar produto." };
  }
}
