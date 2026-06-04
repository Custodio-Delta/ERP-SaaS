import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProductsClient } from "@/components/dashboard/products-client";

export default async function ProductsPage() {
  const session = await getSession();

  if (!session || !session.organization) {
    redirect("/login");
  }

  const products = await db.product.findMany({
    where: { organizationId: session.organization.id },
    orderBy: { createdAt: "desc" },
    include: { variations: true },
  });

  const formattedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    description: p.description,
    price: p.price,
    costPrice: p.costPrice,
    category: p.category,
    variations: p.variations.map((v: any) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
    })),
  }));

  return <ProductsClient initialProducts={formattedProducts} />;
}
