"use client";

import * as React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { upgradePlanAction } from "@/actions/billing";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ArrowUpRight,
  TrendingUp,
  Award,
  Sparkles,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BillingClientProps {
  currentPlan: string;
  periodEnd: Date | null;
}

export function BillingClient({ currentPlan, periodEnd }: BillingClientProps) {
  const [activePlan, setActivePlan] = React.useState(currentPlan);
  const [isLoadingPlan, setIsLoadingPlan] = React.useState<string | null>(null);

  const plans = [
    {
      name: "FREE",
      title: "Plano Iniciante",
      price: 0,
      description: "Ideal para começar a estruturar sua empresa e validar fluxos.",
      features: [
        "Até 50 clientes ativos",
        "Até 50 produtos em estoque",
        "Fluxo de caixa básico",
        "Suporte por e-mail (48h)",
      ],
    },
    {
      name: "PRO",
      title: "Plano Avançado (Pro)",
      price: 149.0,
      description: "Recursos completos e automatizados com inteligência artificial.",
      features: [
        "Clientes e Leads ilimitados",
        "Estoque e variações ilimitados",
        "AI Financial Insights inclusos",
        "Integração Stripe checkout",
        "Suporte prioritário via WhatsApp",
      ],
    },
    {
      name: "ENTERPRISE",
      title: "Corporativo",
      price: 499.0,
      description: "Customizações sob demanda e suporte estratégico de alto nível.",
      features: [
        "Tudo do plano Pro",
        "Multi-empresa (até 5 tenants)",
        "Audit logs e logs de segurança",
        "Suporte dedicado 24/7",
        "Contrato e SLA personalizados",
      ],
    },
  ];

  const handleUpgrade = async (planName: string) => {
    setIsLoadingPlan(planName);
    const res = await upgradePlanAction(planName);
    if (res.success) {
      setActivePlan(planName);
    }
    setIsLoadingPlan(null);
  };

  const invoices = [
    { id: "INV-9920", amount: 149.0, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), status: "PAID" },
    { id: "INV-8812", amount: 149.0, date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), status: "PAID" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Faturamento & Planos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie o plano ativo do ERP, veja faturas passadas e atualize sua assinatura.
        </p>
      </div>

      {/* Cartão de Status do Plano Atual */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex gap-4 items-start">
          <div className="rounded-lg bg-primary/10 p-3 text-primary shrink-0">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">
                Plano {activePlan === "FREE" ? "Iniciante (Grátis)" : activePlan === "PRO" ? "Avançado (Pro)" : "Corporativo"}
              </h3>
              <span className="text-[10px] bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded-full">
                Assinatura Ativa
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {activePlan === "FREE"
                ? "Você está utilizando a versão de teste gratuita. Faça o upgrade para desbloquear recursos avançados."
                : `Seu plano Pro renova automaticamente em ${periodEnd ? formatDate(periodEnd) : "30 dias"}.`}
            </p>
          </div>
        </div>
        <div className="shrink-0 flex flex-col md:items-end">
          <span className="text-xs text-muted-foreground">Valor mensal</span>
          <span className="text-2xl font-black mt-1">
            {activePlan === "FREE" ? "R$ 0,00" : activePlan === "PRO" ? "R$ 149,00" : "R$ 499,00"}
          </span>
        </div>
      </div>

      {/* Grid de Planos */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Escolha o plano ideal para sua escala</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => {
            const isCurrent = p.name === activePlan;
            return (
              <div
                key={p.name}
                className={cn(
                  "rounded-xl border p-6 flex flex-col bg-card shadow-sm hover:scale-[1.01] transition duration-200",
                  isCurrent ? "border-primary ring-1 ring-primary/45" : "border-border"
                )}
              >
                {/* Title */}
                <div>
                  <h4 className="font-bold text-base text-foreground">{p.title}</h4>
                  <div className="flex items-baseline mt-4 mb-2">
                    <span className="text-2xl font-black">R$ {p.price.toFixed(0)}</span>
                    <span className="text-xs text-muted-foreground ml-1">/mês</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{p.description}</p>
                </div>

                {/* Features List */}
                <div className="mt-6 flex-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recursos</span>
                  <ul className="mt-3 space-y-2.5">
                    {p.features.map((feature) => (
                      <li key={feature} className="flex gap-2 items-start text-xs text-foreground/90">
                        <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Upgrade Button */}
                <div className="mt-6">
                  <button
                    onClick={() => handleUpgrade(p.name)}
                    disabled={isCurrent || isLoadingPlan !== null}
                    className={cn(
                      "w-full py-2 rounded-lg text-xs font-semibold shadow transition-all active:scale-[0.98]",
                      isCurrent
                        ? "bg-muted text-muted-foreground cursor-default border border-border"
                        : "bg-primary text-primary-foreground hover:bg-primary/95"
                    )}
                  >
                    {isLoadingPlan === p.name ? (
                      <span className="flex items-center justify-center gap-1">
                        <svg className="animate-spin h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processando...
                      </span>
                    ) : isCurrent ? (
                      "Seu plano ativo"
                    ) : (
                      "Assinar este plano"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico de Faturas */}
      {activePlan !== "FREE" && (
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4">
            <h4 className="text-sm font-semibold">Histórico de Faturas</h4>
            <p className="text-xs text-muted-foreground">Demonstrativo de cobrança do plano Pro/Enterprise</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                  <th className="pb-3 font-semibold">Código Fatura</th>
                  <th className="pb-3 font-semibold">Data de Cobrança</th>
                  <th className="pb-3 font-semibold">Valor</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 text-right">Recibo</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-accent/10 transition">
                    <td className="py-3 font-mono text-xs font-semibold text-foreground">{inv.id}</td>
                    <td className="py-3 text-muted-foreground">{formatDate(inv.date)}</td>
                    <td className="py-3 text-foreground font-semibold">{formatCurrency(inv.amount)}</td>
                    <td className="py-3 text-center">
                      <span className="text-[10px] bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded-full">
                        Pago
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-muted-foreground hover:text-foreground transition p-1 inline-flex items-center gap-1 text-xs">
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
