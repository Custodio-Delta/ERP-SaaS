import Link from "next/link";
import { Command, ArrowRight, ShieldCheck, Zap, Sparkles, Building2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col grid-bg relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto max-w-7xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Command className="h-6 w-6 text-primary" />
            <span className="font-black text-lg tracking-tight">ERP SaaS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition">
              Entrar
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/95 transition"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>O ERP de próxima geração para startups milionárias</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight max-w-3xl leading-[1.1] mb-6 bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
          Gerencie seu negócio com a velocidade de startups modernas.
        </h1>
        
        <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed mb-10">
          Uma plataforma ERP integrada com CRM, controle de estoque inteligente, faturamento automático, fluxo de caixa e relatórios analíticos em tempo real.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 font-semibold text-primary-foreground shadow-lg hover:bg-primary/95 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Começar Gratuitamente
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-border bg-card px-6 font-semibold text-foreground shadow hover:bg-accent transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Acessar Painel
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mt-24">
          <div className="rounded-xl border border-border/60 bg-card/50 p-6 text-left glass">
            <Zap className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-bold text-sm mb-2 text-foreground">Altíssima Velocidade</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Desenvolvido com Next.js 15 e Server Actions para transições instantâneas e sem loaders desnecessários.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/50 p-6 text-left glass">
            <Building2 className="h-8 w-8 text-indigo-400 mb-4" />
            <h3 className="font-bold text-sm mb-2 text-foreground">Multi-Tenant Nativo</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gerencie múltiplas empresas a partir de uma única conta com isolamento completo e seguro de dados.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/50 p-6 text-left glass">
            <ShieldCheck className="h-8 w-8 text-emerald-400 mb-4" />
            <h3 className="font-bold text-sm mb-2 text-foreground">Pronto para Produção</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Banco PostgreSQL otimizado com Prisma ORM e dockerização integrada pronta para qualquer nuvem.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} ERP SaaS Inc. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
