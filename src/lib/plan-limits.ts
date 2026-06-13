import { db } from "@/lib/db";
import { PLANS } from "./plans";

export type PlanResource = "customers" | "products";

export async function checkPlanLimit(organizationId: string, resource: PlanResource) {
  const sub = await db.subscription.findUnique({
    where: { organizationId }
  });

  // Se não tem subscription ou está FREE, trata como Iniciante
  const planName = sub?.planName || "FREE";
  
  // Pegamos a config baseada no nome
  // Se "FREE", usamos INICIANTE, senao PRO ou ENTERPRISE
  const planConfig = planName === "FREE" ? PLANS.INICIANTE : PLANS[planName as keyof typeof PLANS] || PLANS.INICIANTE;
  
  const limit = planConfig.limits[resource];
  
  if (limit === Infinity) {
    return { allowed: true, current: 0, limit, planName };
  }

  let current = 0;
  if (resource === "customers") {
    current = await db.customer.count({ where: { organizationId } });
  } else if (resource === "products") {
    current = await db.product.count({ where: { organizationId } });
  }

  return {
    allowed: current < limit,
    current,
    limit,
    planName
  };
}
