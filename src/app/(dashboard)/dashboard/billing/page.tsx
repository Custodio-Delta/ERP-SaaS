import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BillingClient } from "@/components/dashboard/billing-client";

export default async function BillingPage() {
  const session = await getSession();

  if (!session || !session.organization) {
    redirect("/login");
  }

  // Busca assinatura da organização
  let planName = "FREE";
  let currentPeriodEnd: Date | null = null;

  try {
    const subscription = await db.subscription.findUnique({
      where: {
        organizationId: session.organization.id,
      },
    });

    if (subscription) {
      planName = subscription.planName;
      currentPeriodEnd = subscription.currentPeriodEnd;
    }
  } catch (error) {
    console.error("Erro ao buscar plano ativo no faturamento:", error);
  }

  return (
    <BillingClient
      currentPlan={planName}
      periodEnd={currentPeriodEnd}
    />
  );
}
