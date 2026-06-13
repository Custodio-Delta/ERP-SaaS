"use client";

import * as React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { upgradePlanAction } from "@/actions/billing";
import { generatePixQRCode } from "@/lib/pix";
import { PLANS } from "@/lib/plans";
import {
  CreditCard,
  CheckCircle,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  amount: number;
  planName: string;
  status: string;
  dueDate: Date;
  paidAt: Date | null;
  pixPayload: string;
}

interface BillingClientProps {
  currentPlan: string;
  trialEndsAt: Date | null;
  isTrialExpired: boolean;
  invoices: Invoice[];
}

export function BillingClient({ currentPlan, trialEndsAt, isTrialExpired, invoices }: BillingClientProps) {
  const [activePlan, setActivePlan] = React.useState(currentPlan);
  const [isLoadingPlan, setIsLoadingPlan] = React.useState<string | null>(null);
  
  // PIX Modal State
  const [showPixModal, setShowPixModal] = React.useState(false);
  const [pixQrCodeUrl, setPixQrCodeUrl] = React.useState("");
  const [pixPayload, setPixPayload] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  // Arrays de planos vindos da config unificada (convertendo o objeto para array renderizável)
  const plansList = [PLANS.INICIANTE, PLANS.PRO, PLANS.ENTERPRISE];

  const handleUpgrade = async (planName: string) => {
    setIsLoadingPlan(planName);
    const res = await upgradePlanAction(planName);
    
    if (res.success && res.invoice) {
      setPixPayload(res.invoice.pixPayload);
      const qrCodeDataUrl = await generatePixQRCode(res.invoice.pixPayload);
      setPixQrCodeUrl(qrCodeDataUrl);
      setShowPixModal(true);
    }
    setIsLoadingPlan(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 relative">
      {/* Trial Expirado Banner */}
      {isTrialExpired && activePlan === "FREE" && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 flex gap-3 items-start">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <h4 className="font-semibold text-destructive">Seu período de teste grátis expirou</h4>
            <p className="text-sm text-destructive/90 mt-1">
              O acesso de 30 dias foi encerrado. Escolha um plano abaixo e efetue o pagamento da fatura para continuar utilizando o sistema.
            </p>
          </div>
        </div>
      )}

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
                Plano {activePlan === "FREE" ? "Iniciante (Trial)" : PLANS[activePlan as keyof typeof PLANS]?.title || "Atual"}
              </h3>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                activePlan === "FREE" && !isTrialExpired ? "bg-amber-500/10 text-amber-500" :
                activePlan === "FREE" && isTrialExpired ? "bg-destructive/10 text-destructive" :
                "bg-green-500/10 text-green-400"
              )}>
                {activePlan === "FREE" && !isTrialExpired ? "Período de Teste" :
                 activePlan === "FREE" && isTrialExpired ? "Inativo / Expirado" :
                 "Assinatura Ativa"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {activePlan === "FREE" && !isTrialExpired
                ? `Você está utilizando a versão de teste. Seu acesso grátis termina em ${trialEndsAt ? formatDate(trialEndsAt) : "breve"}.`
                : activePlan === "FREE" && isTrialExpired
                ? "Acesso bloqueado. Realize o pagamento de uma fatura para liberar o sistema."
                : "Sua assinatura está ativa e regularizada."}
            </p>
          </div>
        </div>
        <div className="shrink-0 flex flex-col md:items-end">
          <span className="text-xs text-muted-foreground">Valor mensal</span>
          <span className="text-2xl font-black mt-1">
            {activePlan === "FREE" ? "R$ 49,00" : `R$ ${PLANS[activePlan as keyof typeof PLANS]?.price.toFixed(2).replace('.', ',')}`}
          </span>
        </div>
      </div>

      {/* Grid de Planos */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Escolha o plano ideal para sua escala</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {plansList.map((p) => {
            const isCurrent = p.name === activePlan || (activePlan === "FREE" && p.name === "FREE");
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
                    disabled={isLoadingPlan !== null}
                    className={cn(
                      "w-full py-2 rounded-lg text-xs font-semibold shadow transition-all active:scale-[0.98]",
                      isCurrent && !isTrialExpired
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
                        Gerando Fatura...
                      </span>
                    ) : isCurrent && !isTrialExpired ? (
                      "Seu plano ativo"
                    ) : (
                      "Pagar via PIX"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Histórico de Faturas (Real DB) */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4">
          <h4 className="text-sm font-semibold">Histórico de Faturas</h4>
          <p className="text-xs text-muted-foreground">Faturas e pagamentos realizados via PIX</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                <th className="pb-3 font-semibold">Código / Plano</th>
                <th className="pb-3 font-semibold">Data Emissão</th>
                <th className="pb-3 font-semibold">Valor</th>
                <th className="pb-3 font-semibold text-center">Status</th>
                <th className="pb-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                    Nenhuma fatura gerada ainda.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-accent/10 transition">
                    <td className="py-3">
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {inv.id.substring(0, 8).toUpperCase()}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{PLANS[inv.planName as keyof typeof PLANS]?.title || inv.planName}</div>
                    </td>
                    <td className="py-3 text-muted-foreground text-xs">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 text-foreground font-semibold text-xs">{formatCurrency(inv.amount)}</td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        inv.status === "PAID" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-500"
                      )}>
                        {inv.status === "PAID" ? "Pago" : "Pendente"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {inv.status === "PENDING" && (
                        <button 
                          onClick={async () => {
                            setPixPayload(inv.pixPayload);
                            const url = await generatePixQRCode(inv.pixPayload);
                            setPixQrCodeUrl(url);
                            setShowPixModal(true);
                          }}
                          className="text-primary hover:text-primary/80 transition font-medium text-xs bg-primary/10 px-2 py-1 rounded"
                        >
                          Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PIX Payment Modal */}
      {showPixModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowPixModal(false)} />
          <div className="relative w-full max-w-sm bg-card border border-border rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPixModal(false)} 
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-6 mt-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Pague com PIX</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Abra o app do seu banco e escaneie o código abaixo.
              </p>
            </div>

            {/* QR Code Image */}
            <div className="bg-white p-4 rounded-xl flex items-center justify-center mx-auto w-fit mb-6 shadow-sm">
              {pixQrCodeUrl ? (
                <img src={pixQrCodeUrl} alt="PIX QR Code" className="w-48 h-48 object-contain" />
              ) : (
                <div className="w-48 h-48 bg-gray-100 animate-pulse rounded-lg" />
              )}
            </div>

            {/* Copia e Cola */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Pix Copia e Cola</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={pixPayload} 
                  className="flex-1 bg-muted/50 border border-border rounded-lg px-3 py-2 text-xs text-foreground outline-none font-mono truncate"
                />
                <button 
                  onClick={copyToClipboard}
                  className="bg-primary text-primary-foreground p-2 rounded-lg hover:bg-primary/90 transition shrink-0"
                  title="Copiar código PIX"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border/50 text-center">
              <p className="text-[11px] text-muted-foreground">
                O acesso será liberado assim que o pagamento for identificado pela nossa equipe.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
