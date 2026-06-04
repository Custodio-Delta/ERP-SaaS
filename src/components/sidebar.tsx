"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
  ChevronsUpDown,
  Menu,
  X,
  Bell,
  Sparkles,
  Command
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction, switchOrgAction } from "@/actions/auth";

interface SidebarProps {
  session: {
    user: {
      name: string;
      email: string;
      image?: string | null;
    };
    organization: {
      id: string;
      name: string;
      slug: string;
    } | null;
    memberships: Array<{
      id: string;
      role: string;
      organization: {
        id: string;
        name: string;
        slug: string;
      };
    }>;
  };
}

export function Sidebar({ session }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Financeiro", href: "/dashboard/financial", icon: DollarSign },
    { name: "CRM / Clientes", href: "/dashboard/crm", icon: Users },
    { name: "Produtos & Estoque", href: "/dashboard/products", icon: Package },
    { name: "Vendas & Pedidos", href: "/dashboard/sales", icon: ShoppingCart },
    { name: "Faturamento & Planos", href: "/dashboard/billing", icon: CreditCard },
  ];

  const handleSwitchOrg = async (orgId: string) => {
    setIsOrgDropdownOpen(false);
    const res = await switchOrgAction(orgId);
    if (res.success) {
      router.refresh();
    }
  };

  const handleLogout = async () => {
    await logoutAction();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden">
        <div className="flex items-center gap-2">
          <Command className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground">ERP SaaS</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: -280 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card p-4 md:hidden"
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div className="flex items-center gap-2">
                <Command className="h-6 w-6 text-primary animate-pulse" />
                <span className="font-bold">ERP SaaS</span>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation links for Mobile */}
            <div className="flex-1 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* User and org switcher for mobile */}
            <div className="border-t border-border pt-4">
              <div className="rounded-lg bg-accent/50 p-3 mb-3">
                <div className="text-xs text-muted-foreground">Empresa Ativa</div>
                <div className="font-semibold text-sm truncate">{session.organization?.name}</div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
                Sair da conta
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 72 : 260 }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
        className="hidden md:flex flex-col border-r border-border bg-card h-screen sticky top-0 left-0 z-40 overflow-visible p-3"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-card border border-border rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition shadow"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Company Dropdown / Org Switcher */}
        <div className="relative mb-4">
          <button
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg p-2 transition hover:bg-accent border border-transparent",
              isOrgDropdownOpen && "bg-accent border-border"
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-1 flex-col items-start truncate text-left">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Empresa</span>
                <span className="text-sm font-semibold truncate leading-none mt-1">
                  {session.organization?.name}
                </span>
              </div>
            )}
            {!isCollapsed && <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />}
          </button>

          {/* Org Selector Dropdown */}
          <AnimatePresence>
            {isOrgDropdownOpen && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 mt-2 z-50 rounded-lg border border-border bg-popover p-1 shadow-lg"
              >
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Alternar empresa
                </div>
                {session.memberships.map((membership) => {
                  const isCurrent = membership.organization.id === session.organization?.id;
                  return (
                    <button
                      key={membership.id}
                      onClick={() => handleSwitchOrg(membership.organization.id)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm text-left hover:bg-accent hover:text-foreground",
                        isCurrent && "bg-primary/10 text-primary font-medium"
                      )}
                    >
                      <span className="truncate">{membership.organization.name}</span>
                      {isCurrent && <span className="text-xs bg-primary/20 px-1.5 py-0.5 rounded text-primary">Ativa</span>}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Search Bar (Linear style helper) */}
        {!isCollapsed && (
          <div className="mb-4">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent("open-command-menu"))}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted transition"
            >
              <div className="flex items-center gap-2">
                <Command className="h-3 w-3" />
                <span>Buscar...</span>
              </div>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg py-2 transition-all duration-200 relative",
                  isCollapsed ? "justify-center px-0" : "px-3",
                  isActive
                    ? "text-primary font-medium bg-primary/10"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!isCollapsed && <span className="text-sm truncate">{item.name}</span>}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 w-[3px] h-3/5 bg-primary rounded-r"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer User Info */}
        <div className="border-t border-border pt-4 mt-auto">
          <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "px-2")}>
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0 text-sm">
              {session.user.name.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-sm font-semibold truncate text-foreground leading-none">
                  {session.user.name}
                </span>
                <span className="text-xs text-muted-foreground truncate mt-1">
                  {session.user.email}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg py-2 text-sm text-destructive hover:bg-destructive/10 transition mt-2",
              isCollapsed ? "justify-center px-0" : "px-3"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Sair da conta</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
}
