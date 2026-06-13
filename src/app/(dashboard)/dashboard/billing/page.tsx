import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BillingClient } from "@/components/dashboard/billing-client";

export default async function BillingPage() {
  const session = await getSession();

  if (!session || !session.organization) {
    redirect("/login");
  }

  // Busca assinatura e faturas da organização
  let planName = "FREE";
  let trialEndsAt: Date | null = null;
  let isTrialExpired = false;
  let invoices: any[] = [];

  try {
    const subscription = await db.subscription.findUnique({
      where: {
        organizationId: session.organization.id,
      },
    });

    if (subscription) {
      planName = subscription.planName;
      trialEndsAt = subscription.trialEndsAt;
      
      if (trialEndsAt && new Date() > trialEndsAt) {
        isTrialExpired = true;
      }
    }

    invoices = await db.planInvoice.findMany({
      where: {
        organizationId: session.organization.id,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

  } catch (error) {
    console.error("Erro ao buscar dados de faturamento:", error);
  }

  return (
    <BillingClient
      currentPlan={planName}
      trialEndsAt={trialEndsAt}
      isTrialExpired={isTrialExpired}
      invoices={invoices}
    />
  );
}
