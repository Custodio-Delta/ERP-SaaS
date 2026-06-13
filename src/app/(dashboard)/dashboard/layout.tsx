import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";
import { CommandMenu } from "@/components/command-menu";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !session.organization) {
    redirect("/login");
  }

  // Verifica expiração do trial
  const sub = await db.subscription.findUnique({
    where: { organizationId: session.organization.id }
  });
  const isTrialExpired = sub?.planName === "FREE" && sub?.trialEndsAt && new Date() > sub.trialEndsAt;

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar Lateral */}
      <Sidebar session={session} />

      {/* Área de Conteúdo Principal */}
      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
        {isTrialExpired && (
          <div className="bg-destructive text-destructive-foreground px-4 py-2 text-sm flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Seu período de teste expirou. <Link href="/dashboard/billing" className="font-bold underline underline-offset-2">Renove sua assinatura</Link> para continuar usando o sistema.
          </div>
        )}
        <main className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Menu de Comando Cmd+K */}
      <CommandMenu />
    </div>
  );
}