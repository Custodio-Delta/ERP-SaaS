import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { SalesClient } from "@/components/dashboard/sales-client";

export default async function SalesPage() {
  const session = await getSession();

  if (!session || !session.organization) {
    redirect("/login");
  }

  const orgId = session.organization.id;

  // Todas as queries em paralelo
  const [sales, customers, products] = await Promise.all([
    db.sale.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    db.customer.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
    }),
    db.product.findMany({
      where: { organizationId: orgId },
      include: {
        variations: {
          select: { id: true, name: true, stock: true },
        },
      },
    }),
  ]);

  const formattedSales = sales.map((s) => ({
    id: s.id,
    customerName: s.customer?.name || "Consumidor Final",
    totalAmount: s.totalAmount,
    status: s.status,
    paymentMethod: s.paymentMethod,
    createdAt: s.createdAt,
  }));

  const formattedCustomers = customers.map((c) => ({ id: c.id, name: c.name }));

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    variations: p.variations.map((v) => ({ id: v.id, name: v.name, stock: v.stock })),
  }));

  return (
    <SalesClient
      initialSales={formattedSales}
      customers={formattedCustomers}
      products={formattedProducts}
    />
  );
}
