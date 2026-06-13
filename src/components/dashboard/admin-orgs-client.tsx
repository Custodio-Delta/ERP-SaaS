"use client";

import * as React from "react";
import { adminChangePlanAction } from "@/actions/admin";
import { Check, Settings2 } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { cn, formatDate } from "@/lib/utils";

interface Organization {
  id: string;
  name: string;
  createdAt: Date;
  subscription: {
    planName: string;
    status: string;
    trialEndsAt: Date | null;
  } | null;
}

export function AdminOrgsClient({ initialOrgs }: { initialOrgs: Organization[] }) {
  const [orgs, setOrgs] = React.useState(initialOrgs);
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleChangePlan = async (orgId: string, newPlan: string) => {
    if (!confirm(`Tem certeza que deseja forçar o plano desta empresa para ${newPlan}?`)) return;

    setLoadingId(orgId);
    const res = await adminChangePlanAction(orgId, newPlan);
    if (res.success) {
      setOrgs((prev) =>
        prev.map((org) => {
          if (org.id === orgId) {
            return {
              ...org,
              subscription: {
                ...(org.subscription || { planName: "FREE", status: "active", trialEndsAt: null }),
                planName: newPlan,
                trialEndsAt: null,
                status: "active",
              },
            };
          }
          return org;
        })
      );
      alert("Plano atualizado com sucesso!");
    } else {
      alert(res.error || "Erro ao alterar plano.");
    }
    setLoadingId(null);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-semibold">Gerenciamento Manual de Empresas</h4>
          <p className="text-xs text-muted-foreground">Mude o plano de qualquer cliente sem depender de fatura.</p>
        </div>
        <div className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
          <Settings2 className="h-4 w-4" />
          {orgs.length} {orgs.length === 1 ? "Empresa" : "Empresas"}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
              <th className="pb-3 font-semibold">Empresa</th>
              <th className="pb-3 font-semibold">Data Cadastro</th>
              <th className="pb-3 font-semibold">Plano Atual</th>
              <th className="pb-3 text-right">Alterar para</th>
            </tr>
          </thead>
          <tbody>
            {orgs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">
                  Nenhuma empresa cadastrada.
                </td>
              </tr>
            ) : (
              orgs.map((org) => {
                const currentPlan = org.subscription?.planName || "FREE";
                const isTrialExpired = currentPlan === "FREE" && org.subscription?.trialEndsAt && new Date() > org.subscription.trialEndsAt;

                return (
                  <tr key={org.id} className="border-b border-border/50 hover:bg-accent/5 transition">
                    <td className="py-4">
                      <div className="font-semibold text-foreground text-sm">
                        {org.name}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        {org.id}
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground text-xs">
                      {formatDate(org.createdAt)}
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="font-medium text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {PLANS[currentPlan as keyof typeof PLANS]?.title || currentPlan}
                        </span>
                        {currentPlan === "FREE" && org.subscription?.trialEndsAt && (
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded", isTrialExpired ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500")}>
                            {isTrialExpired ? "Trial Expirado" : "Em Trial"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <select
                        disabled={loadingId === org.id}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) handleChangePlan(org.id, e.target.value);
                        }}
                        className="bg-card border border-border text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:bg-accent focus:ring-1 focus:ring-primary transition-all disabled:opacity-50 w-32"
                      >
                        <option value="" disabled>Selecionar...</option>
                        {currentPlan !== "FREE" && <option value="FREE">Plano Iniciante</option>}
                        {currentPlan !== "PRO" && <option value="PRO">Plano Pro</option>}
                        {currentPlan !== "ENTERPRISE" && <option value="ENTERPRISE">Plano Corporativo</option>}
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
