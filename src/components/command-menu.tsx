"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  Plus,
  Moon,
  LogOut,
  Building2,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";

export function CommandMenu() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const router = useRouter();

  const actions = [
    { id: "nav-dash", title: "Ir para Dashboard", category: "Navegação", icon: LayoutDashboard, action: () => router.push("/dashboard") },
    { id: "nav-fin", title: "Ir para Módulo Financeiro", category: "Navegação", icon: DollarSign, action: () => router.push("/dashboard/financial") },
    { id: "nav-crm", title: "Ir para CRM / Clientes", category: "Navegação", icon: Users, action: () => router.push("/dashboard/crm") },
    { id: "nav-prod", title: "Ir para Produtos & Estoque", category: "Navegação", icon: Package, action: () => router.push("/dashboard/products") },
    { id: "nav-sales", title: "Ir para Vendas & Pedidos", category: "Navegação", icon: ShoppingCart, action: () => router.push("/dashboard/sales") },
    
    { id: "act-client", title: "Adicionar Novo Cliente / Lead", category: "Ações Rápidas", icon: Plus, action: () => { router.push("/dashboard/crm"); setTimeout(() => window.dispatchEvent(new CustomEvent("open-new-customer")), 300); } },
    { id: "act-prod", title: "Cadastrar Novo Produto", category: "Ações Rápidas", icon: Plus, action: () => { router.push("/dashboard/products"); setTimeout(() => window.dispatchEvent(new CustomEvent("open-new-product")), 300); } },
    { id: "act-trans", title: "Lançar Transação Financeira", category: "Ações Rápidas", icon: Plus, action: () => { router.push("/dashboard/financial"); setTimeout(() => window.dispatchEvent(new CustomEvent("open-new-transaction")), 300); } },
    { id: "act-sale", title: "Registrar Nova Venda", category: "Ações Rápidas", icon: Plus, action: () => { router.push("/dashboard/sales"); setTimeout(() => window.dispatchEvent(new CustomEvent("open-new-sale")), 300); } },

    { id: "sys-logout", title: "Sair da Conta", category: "Sistema", icon: LogOut, action: () => logoutAction() },
  ];

  // Filtra as ações com base na busca
  const filteredActions = actions.filter((action) =>
    action.title.toLowerCase().includes(search.toLowerCase()) ||
    action.category.toLowerCase().includes(search.toLowerCase())
  );

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      
      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-menu", handleCustomOpen);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-menu", handleCustomOpen);
    };
  }, [isOpen, selectedIndex, filteredActions]);

  // Reseta index quando busca muda
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl glass"
          >
            {/* Search Input Area */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3.5">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Busque por páginas, ações rápidas ou comandos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-0 p-0 focus:ring-0"
              />
              <kbd className="pointer-events-none rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px] font-medium text-muted-foreground">
                ESC
              </kbd>
            </div>

            {/* Actions List */}
            <div className="max-h-[320px] overflow-y-auto p-2">
              {filteredActions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Nenhum comando encontrado.
                </div>
              ) : (
                Object.entries(
                  filteredActions.reduce((acc, action) => {
                    if (!acc[action.category]) acc[action.category] = [];
                    acc[action.category].push(action);
                    return acc;
                  }, {} as Record<string, typeof filteredActions>)
                ).map(([category, items]) => (
                  <div key={category} className="mb-2 last:mb-0">
                    {/* Category Label */}
                    <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {category}
                    </div>

                    {/* Category Items */}
                    <div className="space-y-0.5">
                      {items.map((item) => {
                        const globalIndex = filteredActions.findIndex((fa) => fa.id === item.id);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              item.action();
                              setIsOpen(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-all duration-150",
                              isSelected
                                ? "bg-primary text-primary-foreground font-medium shadow-md"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span>{item.title}</span>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1.5 text-xs opacity-80 font-mono">
                                <span>Executar</span>
                                <ChevronRight className="h-3.5 w-3.5" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center bg-muted/40 border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Navegar com as setas</span>
                <span className="bg-muted px-1.5 py-0.5 rounded border border-border">↓</span>
                <span className="bg-muted px-1.5 py-0.5 rounded border border-border">↑</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Confirmar</span>
                <span className="bg-muted px-2.5 py-0.5 rounded border border-border font-mono text-[9px]">Enter</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
