"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Função que verifica se o usuário é o DONO do SaaS
function isAdmin(email: string) {
  return email === "novacode123@gmail.com";
}

export async function getPendingInvoicesAction() {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) {
    return { error: "Não autorizado." };
  }

  try {
    const invoices = await db.planInvoice.findMany({
      where: {
        status: "PENDING"
      },
      include: {
        organization: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: "asc"
      }
    });

    return { success: true, invoices };
  } catch (error) {
    console.error("Erro ao buscar faturas pendentes:", error);
    return { error: "Falha ao buscar faturas." };
  }
}

export async function getAllOrganizationsAction() {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) {
    return { error: "Não autorizado." };
  }

  try {
    const organizations = await db.organization.findMany({
      include: {
        subscription: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return { success: true, organizations };
  } catch (error) {
    console.error("Erro ao buscar organizações:", error);
    return { error: "Falha ao buscar organizações." };
  }
}

export async function markInvoiceAsPaidAction(invoiceId: string) {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) {
    return { error: "Não autorizado." };
  }

  try {
    await db.$transaction(async (tx) => {
      const invoice = await tx.planInvoice.update({
        where: { id: invoiceId },
        data: {
          status: "PAID",
          paidAt: new Date()
        }
      });

      await tx.subscription.update({
        where: { organizationId: invoice.organizationId },
        data: {
          status: "active",
          planName: invoice.planName,
          trialEndsAt: null, 
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      await tx.activityLog.create({
        data: {
          organizationId: invoice.organizationId,
          userId: session.user.id,
          action: "ASSINATURA_PAGA_VIA_PIX",
          entityName: "Subscription",
          entityId: invoice.id,
          details: `Pagamento PIX confirmado. Plano atualizado para ${invoice.planName}.`,
        },
      });
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/billing");
    return { success: true };
  } catch (error) {
    console.error("Erro ao confirmar pagamento:", error);
    return { error: "Falha ao confirmar pagamento." };
  }
}

export async function adminChangePlanAction(orgId: string, newPlanName: string) {
  const session = await getSession();
  if (!session || !isAdmin(session.user.email)) {
    return { error: "Não autorizado." };
  }

  try {
    await db.$transaction(async (tx) => {
      // Atualiza a assinatura da empresa forçadamente
      await tx.subscription.update({
        where: { organizationId: orgId },
        data: {
          status: "active",
          planName: newPlanName,
          trialEndsAt: null, // zera o trial pra ativar logo de cara
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      await tx.activityLog.create({
        data: {
          organizationId: orgId,
          userId: session.user.id,
          action: "PLANO_ALTERADO_ADMIN",
          entityName: "Subscription",
          entityId: orgId,
          details: `Administrador mudou o plano da empresa para ${newPlanName} manualmente.`,
        },
      });
    });

    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar plano:", error);
    return { error: "Falha ao alterar o plano da organização." };
  }
}
