"use client";

import * as React from "react";
import { createCustomerAction, deleteCustomerAction } from "@/actions/crm";
import {
  Users,
  Plus,
  Trash2,
  Mail,
  Phone,
  Search,
  Tag,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Building,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  document: string | null;
  status: string;
  tags: string[];
}

interface CrmClientProps {
  initialCustomers: Customer[];
}

export function CrmClient({ initialCustomers }: CrmClientProps) {
  const [customers, setCustomers] = React.useState<Customer[]>(initialCustomers);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Form State
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [document, setDocument] = React.useState("");
  const [status, setStatus] = React.useState("LEAD");
  const [tagsInput, setTagsInput] = React.useState("");

  React.useEffect(() => {
    const handleCustomOpen = () => {
      setIsModalOpen(true);
    };
    window.addEventListener("open-new-customer", handleCustomOpen);
    return () => {
      window.removeEventListener("open-new-customer", handleCustomOpen);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const res = await createCustomerAction({
      name,
      email,
      phone,
      document,
      status,
      tags,
    });

    if (res.success) {
      const newCustomer: Customer = {
        id: Math.random().toString(),
        name,
        email: email || null,
        phone: phone || null,
        document: document || null,
        status,
        tags,
      };
      setCustomers([...customers, newCustomer]);
      
      // Limpa Formulário
      setName("");
      setEmail("");
      setPhone("");
      setDocument("");
      setStatus("LEAD");
      setTagsInput("");
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteCustomerAction(id);
    if (res.success) {
      setCustomers(customers.filter((c) => c.id !== id));
    }
  };

  // Filtra clientes exibidos
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Divide para as colunas do funil
  const leads = filteredCustomers.filter((c) => c.status === "LEAD");
  const negotiating = filteredCustomers.filter((c) => c.status === "NEGOTIATING");
  const active = filteredCustomers.filter((c) => c.status === "ACTIVE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM / Clientes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie novos contatos, leads qualificados e clientes ativos em um funil integrado.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition animate-fade-in"
        >
          <Plus className="h-4 w-4" />
          Novo Cliente / Lead
        </button>
      </div>

      {/* Estatísticas CRM */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total de Leads</div>
            <div className="text-lg font-bold mt-0.5">{leads.length}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-400 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Em Negociação</div>
            <div className="text-lg font-bold mt-0.5">{negotiating.length}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400 shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Clientes Ativos</div>
            <div className="text-lg font-bold mt-0.5">{active.length}</div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline / Funil de Vendas */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-4">Pipeline Comercial (Kanban)</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Coluna 1: Leads */}
          <div className="rounded-xl border border-border bg-card/40 p-4 min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Leads Recentes</span>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{leads.length}</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {leads.map((c) => (
                <div key={c.id} className="rounded-lg border border-border bg-card p-3 shadow-sm hover:border-primary/40 transition">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate flex items-center gap-1.5">
                    <Mail className="h-3 w-3 shrink-0" />
                    {c.email || "Sem e-mail"}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {c.tags.map((tag) => (
                      <span key={tag} className="text-[9px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/40">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 2: Em Negociação */}
          <div className="rounded-xl border border-border bg-card/40 p-4 min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Em Proposta</span>
              <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">{negotiating.length}</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {negotiating.map((c) => (
                <div key={c.id} className="rounded-lg border border-border bg-card p-3 shadow-sm hover:border-indigo-500/40 transition">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate flex items-center gap-1.5">
                    <Mail className="h-3 w-3 shrink-0" />
                    {c.email || "Sem e-mail"}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {c.tags.map((tag) => (
                      <span key={tag} className="text-[9px] bg-indigo-500/10 px-1.5 py-0.5 rounded text-indigo-400 border border-indigo-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 3: Clientes Ativos */}
          <div className="rounded-xl border border-border bg-card/40 p-4 min-h-[300px] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Clientes Ativos</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">{active.length}</span>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto">
              {active.map((c) => (
                <div key={c.id} className="rounded-lg border border-border bg-card p-3 shadow-sm hover:border-emerald-500/40 transition">
                  <div className="font-semibold text-sm truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 truncate flex items-center gap-1.5">
                    <Mail className="h-3 w-3 shrink-0" />
                    {c.email || "Sem e-mail"}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {c.tags.map((tag) => (
                      <span key={tag} className="text-[9px] bg-emerald-500/10 px-1.5 py-0.5 rounded text-emerald-400 border border-emerald-500/20">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista Principal de Clientes */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h4 className="text-sm font-semibold">Base de Clientes Detalhada</h4>
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary w-full sm:w-60"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                <th className="pb-3 font-semibold">Nome</th>
                <th className="pb-3 font-semibold">E-mail</th>
                <th className="pb-3 font-semibold">Telefone</th>
                <th className="pb-3 font-semibold">Documento</th>
                <th className="pb-3 font-semibold">Tags</th>
                <th className="pb-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhum cliente cadastrado correspondente.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-accent/10 transition">
                    <td className="py-3.5 font-medium text-foreground">{c.name}</td>
                    <td className="py-3.5 text-muted-foreground">{c.email || "-"}</td>
                    <td className="py-3.5 text-muted-foreground">{c.phone || "-"}</td>
                    <td className="py-3.5 text-muted-foreground">{c.document || "-"}</td>
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground border border-border/30">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(c.id)}
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

      {/* Novo Cliente Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl glass">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h3 className="text-lg font-bold">Novo Cliente / Lead</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo ou Razão Social"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">E-mail</label>
                <input
                  type="email"
                  placeholder="exemplo@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Telefone e Documento */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Telefone</label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">CPF / CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Status do Funil */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Estágio do Funil</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="LEAD">Lead (Novo)</option>
                  <option value="NEGOTIATING">Em Negociação / Proposta</option>
                  <option value="ACTIVE">Cliente Ativo (Fechado)</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="ex: vip, recorrente, corporativo"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Cadastrar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
