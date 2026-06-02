import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "@/types";

const COOKIE_NAME = "qolhub_session";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-beddel"
);

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    accountStatus: user.accountStatus,
    emailVerified: user.emailVerified,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as SessionUser["role"],
      phone: payload.phone as string | undefined,
      avatar: payload.avatar as string | undefined,
      accountStatus: payload.accountStatus as SessionUser["accountStatus"],
      emailVerified: Boolean(payload.emailVerified),
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function requireRole(
  user: SessionUser | null,
  roles: SessionUser["role"][]
): user is SessionUser {
  if (!user) return false;
  if (roles.includes(user.role)) return true;
  if (user.role === "super_admin" && roles.includes("admin")) return true;
  return false;
}
