"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/utils";
import { createProductAction, adjustStockAction, deleteProductAction } from "@/actions/products";
import {
  Package,
  Plus,
  Trash2,
  Search,
  AlertTriangle,
  Boxes,
  ArrowUpDown,
  Coins,
  Settings2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductVariation {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price: number;
  costPrice: number;
  category: string | null;
  variations: ProductVariation[];
}

interface ProductsClientProps {
  initialProducts: Product[];
}

export function ProductsClient({ initialProducts }: ProductsClientProps) {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Adjust Stock State
  const [selectedVariationId, setSelectedVariationId] = React.useState("");
  const [selectedProductName, setSelectedProductName] = React.useState("");
  const [adjustQuantity, setAdjustQuantity] = React.useState("");
  const [adjustType, setAdjustType] = React.useState("IN");
  const [adjustNotes, setAdjustNotes] = React.useState("");

  // Form State
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [costPrice, setCostPrice] = React.useState("");
  const [category, setCategory] = React.useState("Geral");
  const [initialStock, setInitialStock] = React.useState("");

  React.useEffect(() => {
    const handleCustomOpen = () => {
      setIsModalOpen(true);
    };
    window.addEventListener("open-new-product", handleCustomOpen);
    return () => {
      window.removeEventListener("open-new-product", handleCustomOpen);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || isNaN(parseFloat(price))) return;

    const res = await createProductAction({
      name,
      description,
      price: parseFloat(price),
      costPrice: costPrice ? parseFloat(costPrice) : 0,
      category,
      stock: initialStock ? parseInt(initialStock) : 0,
    });

    if (res.success) {
      // Cria localmente para feedback rápido
      const newProduct: Product = {
        id: Math.random().toString(),
        name,
        sku: `SKU-${name.substring(0, 3).toUpperCase()}`,
        description,
        price: parseFloat(price),
        costPrice: costPrice ? parseFloat(costPrice) : 0,
        category,
        variations: [
          {
            id: Math.random().toString(),
            name: "Padrão",
            sku: `SKU-${name.substring(0, 3).toUpperCase()}-STD`,
            price: parseFloat(price),
            stock: initialStock ? parseInt(initialStock) : 0,
          },
        ],
      };
      setProducts([newProduct, ...products]);

      // Limpa Formulário
      setName("");
      setDescription("");
      setPrice("");
      setCostPrice("");
      setCategory("Geral");
      setInitialStock("");
      setIsModalOpen(false);
    }
  };

  const handleOpenAdjust = (variationId: string, prodName: string, currentStock: number) => {
    setSelectedVariationId(variationId);
    setSelectedProductName(prodName);
    setAdjustQuantity("");
    setAdjustType("IN");
    setAdjustNotes("");
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustQuantity || isNaN(parseInt(adjustQuantity))) return;

    const quantityInt = parseInt(adjustQuantity);
    const multiplier = adjustType === "OUT" ? -1 : 1;
    const finalQuantity = quantityInt * multiplier;

    const res = await adjustStockAction({
      variationId: selectedVariationId,
      quantity: finalQuantity,
      type: adjustType,
      notes: adjustNotes,
    });

    if (res.success) {
      // Atualiza localmente
      setProducts(
        products.map((p) => ({
          ...p,
          variations: p.variations.map((v) =>
            v.id === selectedVariationId ? { ...v, stock: v.stock + finalQuantity } : v
          ),
        }))
      );
      setIsAdjustModalOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deleteProductAction(id);
    if (res.success) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  // Filtra produtos exibidos
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Cálculos de KPI do Estoque
  const totalSkus = products.reduce((acc, p) => acc + p.variations.length, 0);
  
  const lowStockAlerts = products.reduce((acc, p) => {
    const hasLowStock = p.variations.some((v) => v.stock < 5);
    return hasLowStock ? acc + 1 : acc;
  }, 0);

  const inventoryValue = products.reduce((acc, p) => {
    const stockSum = p.variations.reduce((vAcc, v) => vAcc + v.stock, 0);
    return acc + p.price * stockSum;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produtos & Estoque</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastro de produtos, controle de SKUs físicos e relatórios rápidos de inventário.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Cadastrar Produto
        </button>
      </div>

      {/* Estatísticas de Estoque */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary shrink-0">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total de SKUs</div>
            <div className="text-lg font-bold mt-0.5">{totalSkus}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-yellow-500/10 p-2.5 text-yellow-400 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Alertas de Estoque Baixo</div>
            <div className="text-lg font-bold mt-0.5 text-yellow-400">{lowStockAlerts}</div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-4">
          <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-400 shrink-0">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Valor do Estoque (Preço Venda)</div>
            <div className="text-lg font-bold mt-0.5">{formatCurrency(inventoryValue)}</div>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h4 className="text-sm font-semibold">Inventário de Produtos</h4>
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-muted/50 border border-border rounded-lg px-3 py-1.5 text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary w-full sm:w-60"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs font-semibold">
                <th className="pb-3 font-semibold">Produto</th>
                <th className="pb-3 font-semibold">SKU</th>
                <th className="pb-3 font-semibold">Categoria</th>
                <th className="pb-3 font-semibold text-right">Preço</th>
                <th className="pb-3 font-semibold text-right">Custo</th>
                <th className="pb-3 font-semibold text-center">Qtd. Estoque</th>
                <th className="pb-3 font-semibold text-center">Status</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Nenhum produto cadastrado correspondente.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const defaultVariation = p.variations[0] || { id: "", stock: 0, sku: "-" };
                  const isLowStock = defaultVariation.stock < 5;

                  return (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-accent/10 transition">
                      <td className="py-3.5 font-medium text-foreground">{p.name}</td>
                      <td className="py-3.5 text-muted-foreground font-mono text-xs">{p.sku || defaultVariation.sku}</td>
                      <td className="py-3.5 text-muted-foreground">{p.category || "Geral"}</td>
                      <td className="py-3.5 text-right text-foreground font-semibold">{formatCurrency(p.price)}</td>
                      <td className="py-3.5 text-right text-muted-foreground">{formatCurrency(p.costPrice)}</td>
                      <td className="py-3.5 text-center font-bold">{defaultVariation.stock}</td>
                      <td className="py-3.5 text-center">
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full inline-block",
                          isLowStock ? "bg-yellow-500/10 text-yellow-400" : "bg-green-500/10 text-green-400"
                        )}>
                          {isLowStock ? "Baixo" : "OK"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenAdjust(defaultVariation.id, p.name, defaultVariation.stock)}
                            className="text-muted-foreground hover:text-foreground transition p-1 border border-border rounded hover:bg-accent"
                          >
                            <Settings2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="text-muted-foreground hover:text-destructive transition p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Novo Produto Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl glass">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h3 className="text-lg font-bold">Cadastrar Novo Produto</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Nome do Produto</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do produto ou serviço"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Preço de Venda e Custo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Preço Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Preço Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Categoria e Estoque Inicial */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Categoria</label>
                  <input
                    type="text"
                    placeholder="ex: Eletrônicos"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Estoque Inicial</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={initialStock}
                    onChange={(e) => setInitialStock(e.target.value)}
                    className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Descrição</label>
                <textarea
                  placeholder="Descrição detalhada para faturas e relatórios..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ajustar Estoque Modal */}
      {isAdjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAdjustModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-2xl glass">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <h3 className="text-lg font-bold">Ajustar Estoque</h3>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground">Produto selecionado:</span>
                <div className="font-semibold text-foreground text-sm mt-0.5">{selectedProductName}</div>
              </div>

              {/* Tipo de Ajuste */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Movimentação</label>
                <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setAdjustType("IN")}
                    className={cn("py-1.5 text-xs font-semibold rounded-md", adjustType === "IN" ? "bg-card text-green-400 shadow-sm" : "text-muted-foreground")}
                  >
                    Entrada (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("OUT")}
                    className={cn("py-1.5 text-xs font-semibold rounded-md", adjustType === "OUT" ? "bg-card text-red-400 shadow-sm" : "text-muted-foreground")}
                  >
                    Saída (-)
                  </button>
                </div>
              </div>

              {/* Quantidade */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Quantidade</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">Observações (opcional)</label>
                <input
                  type="text"
                  placeholder="Motivo (ex: inventário anual, devolução)"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
                >
                  Salvar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
