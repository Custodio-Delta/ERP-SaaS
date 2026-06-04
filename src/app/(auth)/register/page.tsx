"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Command, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await registerAction({ name, email, companyName, password });
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Ocorreu um erro ao criar a conta.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background grid-bg p-4">
      <Card className="w-full max-w-md border-border/80 shadow-2xl glass">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-3">
            <Command className="h-6 w-6 text-primary animate-pulse" />
            <span className="font-bold text-lg">ERP SaaS</span>
          </div>
          <CardTitle className="text-xl font-bold">Crie sua conta corporativa</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Inicie a digitalização do seu negócio em segundos
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Seu Nome</label>
              <Input
                type="text"
                required
                placeholder="Ex: João Pedro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">E-mail corporativo</label>
              <Input
                type="email"
                required
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Nome da Empresa</label>
              <Input
                type="text"
                required
                placeholder="Ex: Acme Indústrias"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Senha de Acesso</label>
              <Input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Criar minha conta e empresa
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              Já possui uma conta?{" "}
              <Link href="/login" className="text-primary font-semibold hover:underline">
                Fazer login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
