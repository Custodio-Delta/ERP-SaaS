"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

import { checkPlanLimit } from "@/lib/plan-limits";

export async function createCustomerAction(data: {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  status?: string;
  tags?: string[];
}) {
  const session = await getSession();
  if (!session || !session.organization) {
    return { error: "Acesso não autorizado." };
  }
  const org = session.organization;

  // Verifica os limites do plano
  const limitCheck = await checkPlanLimit(org.id, "customers");
  if (!limitCheck.allowed) {
    return { error: `Limite do plano atingido: Você já possui ${limitCheck.current} clientes no plano ${limitCheck.planName}. Por favor, faça um upgrade para adicionar mais.` };
  }

  try {
    const customer = await db.customer.create({
      data: {
        organizationId: org.id,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        document: data.document || null,
        status: data.status || "LEAD",
        tags: data.tags || [],
      },
    });

    // Registra log de auditoria
    await db.activityLog.create({
      data: {
        organizationId: org.id,
        userId: session.user.id,
        action: "CLIENTE_CADASTRADO",
        entityName: "Customer",
        entityId: customer.id,
        details: `Cadastrado novo cliente/lead: ${data.name} (${data.status})`,
      },
    });

    revalidatePath("/dashboard/crm");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Falha ao registrar cliente." };
  }
}

export async function deleteCustomerAction(id: string) {
  const session = await getSession();
  if (!session || !session.organization) {
    return { error: "Acesso não autorizado." };
  }
  const org = session.organization;

  try {
    await db.customer.delete({
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
        action: "CLIENTE_DELETADO",
        entityName: "Customer",
        entityId: id,
        details: `Excluído cliente/lead ID ${id}`,
      },
    });

    revalidatePath("/dashboard/crm");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Falha ao deletar cliente." };
  }
}
