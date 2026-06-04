"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function upgradePlanAction(planName: string) {
  const session = await getSession();
  if (!session || !session.organization) {
    return { error: "Acesso não autorizado." };
  }

  const orgId = session.organization.id;

  try {
    // 1. Atualizar ou Criar Assinatura
    const subscription = await db.subscription.upsert({
      where: { organizationId: orgId },
      update: {
        planName,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
      },
      create: {
        organizationId: orgId,
        planName,
        status: "active",
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // 2. Registrar log de auditoria
    await db.activityLog.create({
      data: {
        organizationId: orgId,
        userId: session.user.id,
        action: "PLANO_ATUALIZADO",
        entityName: "Subscription",
        entityId: subscription.id,
        details: `Assinatura atualizada para o plano ${planName} com sucesso.`,
      },
    });

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar plano:", error);
    return { error: "Falha ao processar atualização de plano." };
  }
}
