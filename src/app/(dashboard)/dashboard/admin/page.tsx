import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminInvoicesClient } from "@/components/dashboard/admin-invoices-client";
import { AdminOrgsClient } from "@/components/dashboard/admin-orgs-client";
import { getPendingInvoicesAction, getAllOrganizationsAction } from "@/actions/admin";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.user.email !== "novacode123@gmail.com") {
    redirect("/dashboard");
  }

  const resInvoices = await getPendingInvoicesAction();
  const invoices = resInvoices.success && resInvoices.invoices ? resInvoices.invoices : [];

  const resOrgs = await getAllOrganizationsAction();
  const orgs = resOrgs.success && resOrgs.organizations ? resOrgs.organizations : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Painel Admin (Super-Usuário)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aprove pagamentos PIX recebidos ou altere o plano de clientes manualmente.
        </p>
      </div>

      <AdminInvoicesClient initialInvoices={invoices} />
      <AdminOrgsClient initialOrgs={orgs} />
    </div>
  );
}
