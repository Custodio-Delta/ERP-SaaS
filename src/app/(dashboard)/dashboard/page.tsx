import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/charts";

import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import {
  DollarSign,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  PackageSearch,
  ShoppingBag,
  BarChart2,
} from "lucide-react";
import Link from "next/link";

// Componente assíncrono separado para os dados — envolvido em Suspense
async function DashboardContent({ orgId, userName, orgName }: { orgId: string; userName: string; orgName: string }) {
  // 6 queries disparadas em paralelo — sem waterfall
  const [
    revenueSum,
    totalSalesCount,
    activeCustomersCount,
    lowStockCount,
    recentSales,
    activityLogs,
  ] = await Promise.all([
    db.transaction.aggregate({
      where: { organizationId: orgId, type: "INCOME", status: "COMPLETED" },
      _sum: { amount: true },
    }),
    db.sale.count({ where: { organizationId: orgId } }),
    db.customer.count({ where: { organizationId: orgId, status: "ACTIVE" } }),
    db.productVariation.count({
      where: { product: { organizationId: orgId }, stock: { lt: 5 } },
    }),
    db.sale.findMany({
      where: { organizationId: orgId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    db.activityLog.findMany({
      where: { organizationId: orgId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
  ]);

  const totalRevenue = revenueSum._sum.amount || 0;

  const revenueData = [
    { name: "Seg", total: 0 },
    { name: "Ter", total: 0 },
    { name: "Qua", total: 0 },
    { name: "Qui", total: 0 },
    { name: "Sex", total: 0 },
    { name: "Sáb", total: 0 },
    { name: "Dom", total: 0 },
  ];

  const categoryData: { name: string; value: number }[] = [];

  const isEmpty =
    totalSalesCount === 0 &&
    totalRevenue === 0 &&
    activeCustomersCount === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Olá, {userName.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Aqui está a visão geral da{" "}
            <span className="font-semibold text-primary">{orgName}</span> para hoje.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs bg-card border border-border px-3.5 py-1.5 rounded-lg shadow-sm">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <span className="text-muted-foreground">Status do Sistema:</span>
          <span className="font-medium text-green-400">Online</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group hover:border-primary/30 transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Faturamento</span>
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight">{formatCurrency(totalRevenue)}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <TrendingUp className="h-3 w-3" />
              <span>Transações concluídas</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Vendas do Mês</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight">{totalSalesCount}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <ShoppingCart className="h-3 w-3" />
              <span>Pedidos registrados</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Clientes Ativos</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight">{activeCustomersCount}</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Users className="h-3 w-3" />
              <span>Com status ativo</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative overflow-hidden group hover:border-yellow-500/30 transition duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Estoque Baixo</span>
            <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight">{lowStockCount}</span>
            <div className="flex items-center gap-1 text-xs text-yellow-400 mt-2">
              <AlertTriangle className="h-3 w-3" />
              <span>{lowStockCount > 0 ? `Atenção em ${lowStockCount} SKUs` : "Estoque normalizado"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Global */}
      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 flex flex-col items-center justify-center text-center gap-4">
          <div className="rounded-full bg-primary/10 p-5">
            <BarChart2 className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Nenhum dado ainda</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Comece adicionando produtos, clientes e registrando suas primeiras vendas para ver as métricas aqui.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition"
            >
              <PackageSearch className="h-4 w-4" />
              Adicionar Produtos
            </Link>
            <Link
              href="/dashboard/crm"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent transition"
            >
              <Users className="h-4 w-4" />
              Cadastrar Clientes
            </Link>
            <Link
              href="/dashboard/sales"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              Registrar Venda
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Gráficos */}
          <DashboardCharts revenueData={revenueData} categoryData={categoryData} />

          {/* Atividades e Vendas Recentes */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Últimas Vendas */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Últimas Vendas</h4>
                  <p className="text-xs text-muted-foreground">Transações comerciais mais recentes</p>
                </div>
                <Link href="/dashboard/sales" className="text-xs text-primary hover:underline flex items-center gap-1">
                  Ver todas <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentSales.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhuma venda registrada ainda.</p>
                ) : (
                  recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-accent/40 transition">
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate text-foreground">
                          {sale.customer?.name || "Consumidor Final"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Método: {sale.paymentMethod || "Não informado"}
                        </span>
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-sm font-bold text-foreground">
                          {formatCurrency(sale.totalAmount)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                          sale.status === "PAID"
                            ? "bg-green-500/10 text-green-400"
                            : sale.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                        }`}>
                          {sale.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Log de Atividades */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Fluxo de Auditoria</h4>
                  <p className="text-xs text-muted-foreground">Atividades recentes dos membros da equipe</p>
                </div>
              </div>
              <div className="space-y-4">
                {activityLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhuma atividade registrada ainda.</p>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-accent/40 transition">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <Activity className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">
                          <span className="font-semibold">{log.user?.name || "Sistema"}</span>: {log.details}
                        </p>
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          {new Intl.DateTimeFormat("pt-BR", { timeStyle: "short" }).format(new Date(log.createdAt))}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session || !session.organization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-bold">Nenhuma organização encontrada.</h2>
        <p className="text-muted-foreground text-sm mt-2">Crie ou selecione uma empresa para acessar o painel.</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent
        orgId={session.organization.id}
        userName={session.user.name}
        orgName={session.organization.name}
      />
    </Suspense>
  );
}
