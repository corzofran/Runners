import { cookies, headers } from "next/headers";
import { verifySession, SESSION_COOKIE, type SessionPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Lee y valida la sesión directamente desde la cookie (uso en Server Components / route handlers).
 * El middleware ya filtró rutas no autenticadas, pero cada handler vuelve a verificar
 * el JWT en vez de confiar ciegamente en los headers para evitar suplantación.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.rol !== "ADMINISTRADOR") throw new Error("FORBIDDEN");
  return session;
}

export async function requireAtleta(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.rol !== "ATLETA") throw new Error("FORBIDDEN");
  return session;
}

export async function usuarioActual() {
  const session = await getSession();
  if (!session) return null;
  return prisma.usuario.findUnique({
    where: { id: session.sub },
    include: { atleta: true, rol: true },
  });
}
