"use client";

import * as React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { markInvoiceAsPaidAction } from "@/actions/admin";
import { CheckCircle, AlertCircle } from "lucide-react";
import { PLANS } from "@/lib/plans";

interface Invoice {
  id: string;
  amount: number;
  planName: string;
  status: string;
  dueDate: Date;
  createdAt: Date;
  organization: { name: string };
}

export function AdminInvoicesClient({ initialInvoices }: { initialInvoices: Invoice[] }) {
  const [invoices, setInvoices] = React.useState(initialInvoices);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const res = await markInvoiceAsPaidAction(id);
    if (res.success) {
      // Remove a fatura aprovada da lista na tela
      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    } else {
      alert(res.error || "Erro ao aprovar fatura.");
    }
    setLoadingId(null);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-semibold">Faturas PIX Pendentes de Aprovação</h4>
          <p className="text-xs text-muted-foreground">Confirme na sua conta bancária se o valor foi recebido antes de aprovar.</p>
        </div>
        <div className="bg-amber-500/10 text-amber-500 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {invoices.length} {invoices.length === 1 ? "Pendente" : "Pendentes"}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
              <th className="pb-3 font-semibold">Empresa / Código</th>
              <th className="pb-3 font-semibold">Plano Solicitado</th>
              <th className="pb-3 font-semibold">Data Gerada</th>
              <th className="pb-3 font-semibold">Valor Exato</th>
              <th className="pb-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                  Nenhuma fatura PIX aguardando aprovação no momento.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/50 hover:bg-accent/5 transition">
                  <td className="py-4">
                    <div className="font-semibold text-foreground text-sm">
                      {inv.organization.name}
                    </div>
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                      ID: {inv.id.substring(0, 8).toUpperCase()}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="font-medium text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {PLANS[inv.planName as keyof typeof PLANS]?.title || inv.planName}
                    </span>
                  </td>
                  <td className="py-4 text-muted-foreground text-xs">
                    {formatDate(inv.createdAt)}
                  </td>
                  <td className="py-4 text-foreground font-black text-sm">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => handleApprove(inv.id)}
                      disabled={loadingId === inv.id}
                      className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50"
                    >
                      {loadingId === inv.id ? (
                        "Aprovando..."
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Confirmar Pagamento
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
