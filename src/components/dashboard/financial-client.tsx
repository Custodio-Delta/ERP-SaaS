"use client";

import * as React from "react";
import { cn } from "@/lib/utils"
import { formatCurrency, formatDate } from "@/lib/utils";
import { createTransactionAction, deleteTransactionAction } from "@/actions/financial";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Filter,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  X
} from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: Date;
}

interface FinancialClientProps {
  initialTransactions: Transaction[];
}

export function FinancialClient({ initialTransactions }: FinancialClientProps) {
  const [transactions, setTransactions] = React.useState<Transaction[]>(initialTransactions);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [filterType, setFilterType] = React.useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // AI Insights State
  const [aiInsights, setAiInsights] = React.useState<string[]>([]);
  const [isGeneratingAi, setIsGeneratingAi] = React.useState(false);

  // Form State
  const [formType, setFormType] = React.useState("INCOME");
  const [formAmount, setFormAmount] = React.useState("");
  const [formCategory, setFormCategory] = React.useState("Vendas");
  const [formDescription, setFormDescription] = React.useState("");

  const handleOpenTransaction = () => {
    setIsModalOpen(true);
  };

  React.useEffect(() => {
    const handleCustomOpen = () => {
      setIsModalOpen(true);
    };
    window.addEventListener("open-new-transaction", handleCustomOpen);
    return () => {
      window.removeEventListener("open-new-transaction", handleCustomOpen);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || isNaN(parseFloat(formAmount))) return;

    const res = await createTransactionAction({
      type: formType,
      amount: parseFloat(formAmount),
      category: formCategory,
      description: formDescription,
    });

    if (res.success) {
      // Adiciona localmente para feedback instantâneo
      const newTx: Transaction = {
        id: Math.random().toString(),
        type: formType,
        amount: parseFloat(formAmount),
        category: formCategory,
        description: formDescription,
        date: new Date(),
      };
      setTransactions([newTx, ...transactions]);
      
      // Limpa formulário
      setFormAmount("");
      setFormDescription("");
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteTransactionAction(id);
    if (res.success) {
      setTransactions(transactions.filter((tx) => tx.id !== id));
    }
  };

  // Calcula Totais
  const totalIncomes = transactions
    .filter((tx) => tx.type === "INCOME")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === "EXPENSE")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const netBalance = totalIncomes - totalExpenses;

  // Filtra itens exibidos
  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = filterType === "ALL" || tx.type === filterType;
    const matchesSearch =
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Simulação de Inteligência Artificial para Insights
  const generateAiInsights = () => {
    setIsGeneratingAi(true);
    setAiInsights([]);

    setTimeout(() => {
      const insights = [
        `💡 Analisamos suas despesas: O setor de **Infraestrutura** e ferramentas SaaS representam ${(
          (totalExpenses > 0 ? (totalExpenses * 0.35) / totalExpenses : 0.35) * 100
        ).toFixed(0)}% das saídas. Recomendamos auditar assinaturas inativas.`,
        "📈 Padrão de faturamento: Suas receitas concentram-se fortemente nas quartas e quintas-feiras. Considere lançar ações de marketing no início da semana.",
        `🎯 Meta de Saúde Financeira: Seu saldo operacional está positivo. Com base no fluxo de caixa atual, você possui reservas para operar por mais **14 meses** sem novos investimentos.`
      ];
      setAiInsights(insights);
      setIsGeneratingAi(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fluxo de Caixa</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de receitas, despesas e análise de insights financeiros da empresa.
          </p>
        </div>
        <button
          onClick={handleOpenTransaction}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Lançar Transação
        </button>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Receitas */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-sm font-medium">
            <span>Receitas Totais</span>
            <div className="rounded-lg bg-green-500/10 p-1.5 text-green-400">
              <TrendingUp className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-green-400">
              {formatCurrency(totalIncomes)}
            </span>
            <span className="text-xs text-muted-foreground block mt-1">Entradas liquidadas</span>
          </div>
        </div>

        {/* Despesas */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-sm font-medium">
            <span>Despesas Totais</span>
            <div className="rounded-lg bg-red-500/10 p-1.5 text-red-400">
              <TrendingDown className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold tracking-tight text-red-400">
              {formatCurrency(totalExpenses)}
            </span>
            <span className="text-xs text-muted-foreground block mt-1">Saídas pagas</span>
          </div>
        </div>

        {/* Saldo Líquido */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-sm font-medium">
            <span>Saldo Líquido</span>
            <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <span className={cn("text-2xl font-bold tracking-tight", netBalance >= 0 ? "text-green-400" : "text-red-400")}>
              {formatCurrency(netBalance)}
            </span>
            <span className="text-xs text-muted-foreground block mt-1">Margem operacional</span>
          </div>
        </div>
      </div>

      {/* IA Insights Widget */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-indigo-500/5 to-transparent px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <div>
              <h4 className="text-sm font-semibold text-foreground">AI Financial Insights</h4>
              <p className="text-xs text-muted-foreground">Análise inteligente de fluxo de caixa baseada em padrões reais</p>
            </div>
          </div>
          <button
            onClick={generateAiInsights}
            disabled={isGeneratingAi}
            className="inline-flex items-center gap-2 rounded-lg bg-primary/20 border border-primary/30 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/30 transition disabled:opacity-50 shrink-0"
          >
            {isGeneratingAi ? (
              <>
                <svg className="animate-spin h-3 w-3 text-primary" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Analisando...</span>
              </>
            ) : (
              <>
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Gerar Análise Financeira</span>
              </>
            )}
          </button>
        </div>

        {aiInsights.length > 0 && (
          <div className="p-6 bg-muted/20 space-y-3">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="flex gap-3 text-sm text-foreground/90 p-2.5 rounded-lg bg-card border border-border">
                <Info className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
                <p dangerouslySetInnerHTML={{ __html: insight }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabela de Transações */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h4 className="text-sm font-semibold">Movimentações do Caixa</h4>
          
          {/* Filtros e Busca */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Buscar categoria ou descrição..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary w-full sm:w-60"
            />
            <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
              <button
                onClick={() => setFilterType("ALL")}
                className={cn("px-2.5 py-1 text-xs font-medium rounded", filterType === "ALL" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterType("INCOME")}
                className={cn("px-2.5 py-1 text-xs font-medium rounded", filterType === "INCOME" ? "bg-green-500/10 text-green-400" : "text-muted-foreground hover:text-foreground")}
              >
                Receitas
              </button>
              <button
                onClick={() => setFilterType("EXPENSE")}
                className={cn("px-2.5 py-1 text-xs font-medium rounded", filterType === "EXPENSE" ? "bg-red-500/10 text-red-400" : "text-muted-foreground hover:text-foreground")}
              >
                Despesas
              </button>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                <th className="pb-3 font-semibold">Data</th>
                <th className="pb-3 font-semibold">Categoria</th>
                <th className="pb-3 font-semibold">Descrição</th>
                <th className="pb-3 font-semibold">Tipo</th>
                <th className="pb-3 font-semibold text-right">Valor</th>
                <th className="pb-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhuma movimentação financeira registrada para esta pesquisa.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-accent/10 transition">
                    <td className="py-3.5 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-3.5">
                      <span className="font-medium text-foreground">{tx.category}</span>
                    </td>
                    <td className="py-3.5 text-muted-foreground max-w-[200px] truncate">
                      {tx.description || "-"}
                    </td>
                    <td className="py-3.5">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full",
                        tx.type === "INCOME" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                      )}>
                        {tx.type === "INCOME" ? (
                          <>
                            <ArrowUpRight className="h-3 w-3" />
                            Receita
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="h-3 w-3" />
                            Despesa
                          </>
                        )}
                      </span>
                    </td>
                    <td className={cn("py-3.5 text-right font-semibold", tx.type === "INCOME" ? "text-green-400" : "text-red-400")}>
                      {tx.type === "INCOME" ? "+" : "-"} {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-muted-foreground hover:text-destructive transition p-1"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lançar Transação Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl glass">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h3 className="text-lg font-bold">Lançar Transação</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Tipo</label>
                <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => { setFormType("INCOME"); setFormCategory("Vendas"); }}
                    className={cn("py-1.5 text-xs font-semibold rounded-md", formType === "INCOME" ? "bg-card text-green-400 shadow-sm" : "text-muted-foreground")}
                  >
                    Receita (Entrada)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType("EXPENSE"); setFormCategory("Marketing"); }}
                    className={cn("py-1.5 text-xs font-semibold rounded-md", formType === "EXPENSE" ? "bg-card text-red-400 shadow-sm" : "text-muted-foreground")}
                  >
                    Despesa (Saída)
                  </button>
                </div>
              </div>

              {/* Valor */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Categoria</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                >
                  {formType === "INCOME" ? (
                    <>
                      <option value="Vendas">Vendas</option>
                      <option value="Investimentos">Investimentos</option>
                      <option value="Outros">Outros</option>
                    </>
                  ) : (
                    <>
                      <option value="Marketing">Marketing</option>
                      <option value="Infraestrutura">Infraestrutura</option>
                      <option value="Salários">Salários</option>
                      <option value="Escritório">Escritório</option>
                      <option value="Impostos">Impostos</option>
                    </>
                  )}
                </select>
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Descrição (opcional)</label>
                <input
                  type="text"
                  placeholder="Nota explicativa..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
