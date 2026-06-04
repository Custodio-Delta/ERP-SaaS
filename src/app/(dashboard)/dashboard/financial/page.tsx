import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { FinancialClient } from "@/components/dashboard/financial-client";

export default async function FinancialPage() {
  const session = await getSession();

  if (!session || !session.organization) {
    redirect("/login");
  }

  const transactions = await db.transaction.findMany({
    where: { organizationId: session.organization.id },
    orderBy: { date: "desc" },
  });

  const formattedTransactions = transactions.map((tx) => ({
    id: tx.id,
    type: tx.type,
    amount: tx.amount,
    category: tx.category,
    description: tx.description,
    date: tx.date,
  }));

  return <FinancialClient initialTransactions={formattedTransactions} />;
}
