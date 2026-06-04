import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CrmClient } from "@/components/dashboard/crm-client";

export default async function CrmPage() {
  const session = await getSession();

  if (!session || !session.organization) {
    redirect("/login");
  }

  const customers = await db.customer.findMany({
    where: { organizationId: session.organization.id },
    orderBy: { createdAt: "desc" },
  });

  const formattedCustomers = customers.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    document: c.document,
    status: c.status,
    tags: c.tags,
  }));

  return <CrmClient initialCustomers={formattedCustomers} />;
}
