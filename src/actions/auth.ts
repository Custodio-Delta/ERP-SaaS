"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/validations/auth";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function loginAction(data: LoginInput) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { error: "Dados inválidos." };
  }

  const { email, password } = result.data;

  // Encontra o usuário e a senha correspondente na tabela Account
  const user = await db.user.findUnique({
    where: { email },
    include: {
      accounts: {
        where: { providerId: "credentials" },
      },
      memberships: true,
    },
  });

  if (!user || user.accounts.length === 0) {
    return { error: "E-mail ou senha incorretos." };
  }

  const account = user.accounts[0];
  const isPasswordValid = verifyPassword(password, account.password || "");

  if (!isPasswordValid) {
    return { error: "E-mail ou senha incorretos." };
  }

  // Criar Sessão no Banco
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

  await db.session.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // Salvar Cookies
  const cookieStore = await cookies();
  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });

  // Definir empresa ativa inicial
  if (user.memberships.length > 0) {
    cookieStore.set("active_org_id", user.memberships[0].organizationId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });
  }

  return { success: true };
}

export async function registerAction(data: RegisterInput) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return { error: "Dados inválidos." };
  }

  const { name, email, companyName, password } = result.data;

  // Verificar se usuário existe
  const existingUser = await db.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "Este e-mail já está sendo utilizado." };
  }

  // Gerar slug único para a organização
  let slug = slugify(companyName);
  const existingOrg = await db.organization.findUnique({
    where: { slug },
  });

  if (existingOrg) {
    slug = `${slug}-${crypto.randomBytes(3).toString("hex")}`;
  }

  // Executar transação de criação
  const hashedPassword = hashPassword(password);

  try {
    const newUser = await db.$transaction(async (tx) => {
      // 1. Criar usuário
      const user = await tx.user.create({
        data: {
          name,
          email,
        },
      });

      // 2. Criar credenciais na tabela Account
      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credentials",
          password: hashedPassword,
        },
      });

      // 3. Criar Organização
      const org = await tx.organization.create({
        data: {
          name: companyName,
          slug,
        },
      });

      // 4. Criar Membership (Dono)
      await tx.membership.create({
        data: {
          userId: user.id,
          organizationId: org.id,
          role: "OWNER",
        },
      });

      // 5. Criar assinatura inicial (Plano Iniciante com 30 dias de trial)
      await tx.subscription.create({
        data: {
          organizationId: org.id,
          status: "trialing",
          planName: "FREE",
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        },
      });

      return { user, org };
    });

    // Criar Sessão no Banco
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias

    await db.session.create({
      data: {
        token,
        userId: newUser.user.id,
        expiresAt,
      },
    });

    // Salvar Cookies
    const cookieStore = await cookies();
    cookieStore.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });

    cookieStore.set("active_org_id", newUser.org.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });

    return { success: true };
  } catch (error) {
    return { error: "Erro ao criar conta. Tente novamente mais tarde." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (sessionToken) {
    await db.session.deleteMany({
      where: { token: sessionToken },
    });
  }

  cookieStore.delete("session_token");
  cookieStore.delete("active_org_id");

  redirect("/login");
}

export async function switchOrgAction(orgId: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token")?.value;

  if (!sessionToken) return { error: "Sessão expirada." };

  const session = await db.session.findUnique({
    where: { token: sessionToken },
    include: {
      user: {
        include: {
          memberships: true,
        },
      },
    },
  });

  if (!session) return { error: "Sessão expirada." };

  // Validar se o usuário pertence a essa organização
  const belongsToOrg = session.user.memberships.some((m) => m.organizationId === orgId);

  if (!belongsToOrg) {
    return { error: "Acesso negado para esta organização." };
  }

  // Atualizar cookie de empresa ativa
  cookieStore.set("active_org_id", orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    path: "/",
  });

  return { success: true };
}
