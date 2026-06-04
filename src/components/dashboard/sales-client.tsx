"use client";

import * as React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { createSaleAction, deleteSaleAction } from "@/actions/sales";
import {
  ShoppingCart,
  Plus,
  Trash2,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  User,
  ShoppingBag,
  AlertTriangle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  variations: Array<{
    id: string;
    name: string;
    stock: number;
  }>;
}

interface Sale {
  id: string;
  customerName: string;
  totalAmount: number;
  status: string;
  paymentMethod: string | null;
  createdAt: Date;
}

interface SalesClientProps {
  initialSales: Sale[];
  customers: Customer[];
  products: Product[];
}

export function SalesClient({ initialSales, customers, products }: SalesClientProps) {
  const [sales, setSales] = React.useState<Sale[]>(initialSales);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("");
  const [selectedVariationId, setSelectedVariationId] = React.useState("");
  const [quantity, setQuantity] = React.useState("1");
  const [status, setStatus] = React.useState("PAID");
  const [paymentMethod, setPaymentMethod] = React.useState("PIX");

  React.useEffect(() => {
    const handleCustomOpen = () => {
      setIsModalOpen(true);
    };
    window.addEventListener("open-new-sale", handleCustomOpen);
    return () => {
      window.removeEventListener("open-new-sale", handleCustomOpen);
    };
  }, []);

  // Busca preço do produto selecionado para exibir no formulário
  const selectedProductDetails = React.useMemo(() => {
    if (!selectedVariationId) return null;
    for (const p of products) {
      const v = p.variations.find((varItem) => varItem.id === selectedVariationId);
      if (v) return { name: p.name, price: p.price, stock: v.stock };
    }
    return null;
  }, [selectedVariationId, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariationId || !quantity || isNaN(parseInt(quantity))) return;

    const qty = parseInt(quantity);
    const price = selectedProductDetails?.price || 0;

    const res = await createSaleAction({
      customerId: selectedCustomerId || undefined,
      items: [
        {
          productVariationId: selectedVariationId,
          quantity: qty,
          unitPrice: price,
        },
      ],
      status,
      paymentMethod,
    });

    if (res.success) {
      const matchedCust = customers.find((c) => c.id === selectedCustomerId);
      const newSale: Sale = {
        id: Math.random().toString().substring(2, 10),
        customerName: matchedCust?.name || "Consumidor Final",
        totalAmount: price * qty,
        status,
        paymentMethod,
        createdAt: new Date(),
      };
      setSales([newSale, ...sales]);

      // Limpa formulário
      setSelectedCustomerId("");
      setSelectedVariationId("");
      setQuantity("1");
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteSaleAction(id);
    if (res.success) {
      setSales(sales.filter((s) => s.id !== id));
    }
  };

  // Filtra as vendas
  const filteredSales = sales.filter((s) =>
    s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // KPIs
  const paidSales = sales.filter((s) => s.status === "PAID");
  const totalRevenue = paidSales.reduce((acc, s) => acc + s.totalAmount, 0);
  const totalOrders = sales.length;
  const ticketMedio = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vendas & Pedidos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestão de pedidos faturados, ticket médio e controle automático de baixas de estoque.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Registrar Nova Venda
        </button>
      </div>

      {/* Estatísticas Vendas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Faturamento Vendas (Pago)</div>
            <div className="text-lg font-bold mt-0.5">{formatCurrency(totalRevenue)}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-400 shrink-0">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Pedidos Efetuados</div>
            <div className="text-lg font-bold mt-0.5">{totalOrders}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Ticket Médio</div>
            <div className="text-lg font-bold mt-0.5">{formatCurrency(ticketMedio)}</div>
          </div>
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h4 className="text-sm font-semibold">Registro de Pedidos Comerciais</h4>
          <input
            type="text"
            placeholder="Buscar por ID ou cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary w-full sm:w-60"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                <th className="pb-3 font-semibold">Pedido ID</th>
                <th className="pb-3 font-semibold">Cliente</th>
                <th className="pb-3 font-semibold">Data</th>
                <th className="pb-3 font-semibold text-right">Total</th>
                <th className="pb-3 font-semibold">Forma Pagamento</th>
                <th className="pb-3 font-semibold text-center">Status</th>
                <th className="pb-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    Nenhum pedido comercial registrado correspondente.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-accent/10 transition">
                    <td className="py-3.5 font-mono text-xs font-semibold text-primary">#{s.id.substring(0, 8)}</td>
                    <td className="py-3.5 font-medium text-foreground">{s.customerName}</td>
                    <td className="py-3.5 text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(s.createdAt)}
                    </td>
                    <td className="py-3.5 text-right font-bold text-foreground">{formatCurrency(s.totalAmount)}</td>
                    <td className="py-3.5 text-muted-foreground">{s.paymentMethod || "Não informado"}</td>
                    <td className="py-3.5 text-center">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full inline-block",
                        s.status === "PAID"
                          ? "bg-green-500/10 text-green-400"
                          : s.status === "PENDING"
                          ? "bg-yellow-500/10 text-yellow-400"
                          : "bg-red-500/10 text-red-400"
                      )}>
                        {s.status === "PAID" ? "Pago" : s.status === "PENDING" ? "Pendente" : "Cancelado"}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(s.id)}
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

      {/* Registrar Venda Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl glass">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h3 className="text-lg font-bold">Registrar Venda</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cliente */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5 flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  Cliente
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Consumidor Final (Sem cadastro)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Produto/Variação */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5 flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Produto
                </label>
                <select
                  required
                  value={selectedVariationId}
                  onChange={(e) => setSelectedVariationId(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Selecione o produto...</option>
                  {products.map((p) => {
                    const defaultVariation = p.variations[0];
                    if (!defaultVariation) return null;
                    return (
                      <option key={defaultVariation.id} value={defaultVariation.id}>
                        {p.name} - {formatCurrency(p.price)} (Estoque: {defaultVariation.stock})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Quantidade e Valor de Venda */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Quantidade</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Total Estimado</span>
                  <div className="h-9 flex items-center px-3 bg-muted/30 border border-border rounded-lg text-sm font-bold text-foreground">
                    {selectedProductDetails
                      ? formatCurrency(selectedProductDetails.price * (parseInt(quantity) || 0))
                      : "R$ 0,00"}
                  </div>
                </div>
              </div>

              {/* Forma de Pagamento e Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Forma Pagamento</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="PIX">PIX</option>
                    <option value="CREDIT_CARD">Cartão Crédito</option>
                    <option value="BOLETO">Boleto Bancário</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Status Venda</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="PAID">Paga (Baixa imediata)</option>
                    <option value="PENDING">Pendente</option>
                  </select>
                </div>
              </div>

              {selectedProductDetails && selectedProductDetails.stock < parseInt(quantity) && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2.5 flex gap-2 text-xs text-yellow-400">
                  <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                  <span>Atenção: A quantidade excede o estoque físico disponível ({selectedProductDetails.stock}).</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Registrar Venda / Faturar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
