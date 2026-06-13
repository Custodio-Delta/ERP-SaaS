"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { generatePixPayload } from "@/lib/pix";

const PIX_KEY = "58455438860"; // Chave definida pelo usuário

export async function upgradePlanAction(planName: string) {
  const session = await getSession();
  if (!session || !session.organization) {
    return { error: "Acesso não autorizado." };
  }

  const orgId = session.organization.id;
  const plan = PLANS[planName as keyof typeof PLANS];

  if (!plan) {
    return { error: "Plano inválido." };
  }

  try {
    // 1. Gerar Payload Pix para a Fatura
    const pixPayload = generatePixPayload(PIX_KEY, plan.price);

    // 2. Criar a fatura pendente (PlanInvoice)
    const invoice = await db.planInvoice.create({
      data: {
        organizationId: orgId,
        amount: plan.price,
        planName: plan.name,
        status: "PENDING",
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Vence em 3 dias
        pixKey: PIX_KEY,
        pixPayload: pixPayload,
      },
    });

    // Registra log de auditoria
    await db.activityLog.create({
      data: {
        organizationId: orgId,
        userId: session.user.id,
        action: "FATURA_GERADA",
        entityName: "PlanInvoice",
        entityId: invoice.id,
        details: `Gerada fatura PIX para assinatura do plano ${plan.title}.`,
      },
    });

    revalidatePath("/dashboard/billing");
    revalidatePath("/dashboard");
    
    // Retorna a fatura criada para o frontend exibir o QR Code
    return { 
      success: true, 
      invoice: {
        id: invoice.id,
        pixPayload: invoice.pixPayload,
        amount: invoice.amount
      } 
    };
  } catch (error) {
    console.error("Erro ao gerar fatura do plano:", error);
    return { error: "Falha ao gerar fatura de assinatura." };
  }
}
