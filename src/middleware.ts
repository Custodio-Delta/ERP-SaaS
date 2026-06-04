import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("session_token")?.value;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // Se for rota de dashboard e não estiver autenticado -> Redireciona para Login
  if (isDashboardRoute && !sessionToken) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  // Se for rota de autenticação (login/cadastro) e já estiver autenticado -> Redireciona para Dashboard
  if (isAuthRoute && sessionToken) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
