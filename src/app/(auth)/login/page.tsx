"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Command, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await loginAction({ email, password });
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Ocorreu um erro ao fazer login.");
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
          <CardTitle className="text-xl font-bold">Acesse sua conta</CardTitle>
          <CardDescription className="text-muted-foreground text-xs">
            Insira suas credenciais abaixo para entrar no painel da empresa
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/15 border border-destructive/30 p-3 text-xs text-destructive">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">E-mail</label>
              <Input
                type="email"
                required
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Senha</label>
                <Link href="#" className="text-xs text-primary hover:underline">Esqueceu a senha?</Link>
              </div>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" isLoading={isLoading}>
              Entrar no painel
            </Button>
            <div className="text-center text-xs text-muted-foreground">
              Não possui uma conta?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Cadastre sua empresa
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
