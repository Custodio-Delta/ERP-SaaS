"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function createTransactionAction(data: {
  type: string;
  amount: number;
  category: string;
  description?: string;
  status?: string;
}) {
  const session = await getSession();
  if (!session || !session.organization) {
    return { error: "Acesso não autorizado." };
  }
  const org = session.organization;

  try {
    const transaction = await db.transaction.create({
      data: {
        organizationId: org.id,
        type: data.type,
        amount: data.amount,
        category: data.category,
        description: data.description || "",
        status: data.status || "COMPLETED",
      },
    });

    // Registra log de auditoria
    await db.activityLog.create({
      data: {
        organizationId: org.id,
        userId: session.user.id,
        action: "TRANSACAO_CRIADA",
        entityName: "Transaction",
        entityId: transaction.id,
        details: `Lançada nova transação de ${data.type === "INCOME" ? "Receita" : "Despesa"}: ${data.category} no valor de R$ ${data.amount}`,
      },
    });

    revalidatePath("/dashboard/financial");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Falha ao registrar transação financeira." };
  }
}

export async function deleteTransactionAction(id: string) {
  const session = await getSession();
  if (!session || !session.organization) {
    return { error: "Acesso não autorizado." };
  }
  const org = session.organization;

  try {
    const deleted = await db.transaction.delete({
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
        action: "TRANSACAO_DELETADA",
        entityName: "Transaction",
        entityId: id,
        details: `Excluída transação ID ${id} de R$ ${deleted.amount}`,
      },
    });

    revalidatePath("/dashboard/financial");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Falha ao deletar transação." };
  }
}
