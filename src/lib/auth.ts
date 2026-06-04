import crypto from "crypto";
import { cache } from "react";
import { db } from "./db";
import { cookies as nextCookies } from "next/headers";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");

  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  return `${salt}:${hash}`;
}

export function verifyPassword(
  password: string,
  storedHash: string
): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");

    if (!salt || !originalHash) return false;

    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex");

    return hash === originalHash;
  } catch (error) {
    return false;
  }
}

export const getSession = cache(async function getSession() {
  try {
    const cookieStore = await nextCookies();

    const sessionToken =
      cookieStore.get("session_token")?.value;

    if (!sessionToken) return null;

    const session = await db.session.findUnique({
      where: {
        token: sessionToken,
      },
      include: {
        user: {
          include: {
            memberships: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
    });

    if (!session) return null;

    // Expired session
    if (new Date() > session.expiresAt) {
      await db.session.delete({
        where: {
          token: sessionToken,
        },
      });

      return null;
    }

    // Active organization
    let activeOrgId =
      cookieStore.get("active_org_id")?.value;

    let activeMembership =
      session.user.memberships.find(
        (m) => m.organizationId === activeOrgId
      );

    if (
      !activeMembership &&
      session.user.memberships.length > 0
    ) {
      activeMembership =
        session.user.memberships[0];

      activeOrgId =
        activeMembership.organizationId;
    }

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },

      organization:
        activeMembership?.organization || null,

      membership: activeMembership
        ? {
            id: activeMembership.id,
            role: activeMembership.role,
          }
        : null,

      memberships:
        session.user.memberships.map((m) => ({
          id: m.id,
          role: m.role,
          organization: m.organization,
        })),
    };
  } catch (error) {
    console.error("Session error:", error);
    return null;
  }
});

export async function hasPermission(
  requiredRole:
    | "OWNER"
    | "ADMIN"
    | "MANAGER"
    | "MEMBER"
) {
  const session = await getSession();

  if (!session || !session.membership) {
    return false;
  }

  const rolesHierarchy = {
    OWNER: 4,
    ADMIN: 3,
    MANAGER: 2,
    MEMBER: 1,
  };

  const userRoleValue =
    rolesHierarchy[
      session.membership.role as keyof typeof rolesHierarchy
    ] || 0;

  const requiredRoleValue =
    rolesHierarchy[requiredRole] || 0;

  return userRoleValue >= requiredRoleValue;
}
