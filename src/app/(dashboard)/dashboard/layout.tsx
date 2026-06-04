import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { CommandMenu } from "@/components/command-menu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar Lateral */}
      <Sidebar session={session} />

      {/* Área de Conteúdo Principal */}
      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
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
