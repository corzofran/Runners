import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

// Nota: la validación se hace de forma diferida (dentro de getSecretKey), no al importar
// el módulo. Next.js evalúa este archivo durante "Collecting page data" en el build de
// Vercel; si la variable faltara y lanzáramos aquí arriba, tumbaría TODO el build en vez
// de fallar solo cuando de verdad se intenta firmar/verificar un token.
function getSecretKey(): Uint8Array {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error(
      "JWT_SECRET no está definido. Configúralo como variable de entorno antes de desplegar."
    );
  }
  return new TextEncoder().encode(JWT_SECRET);
}
const EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export type SessionPayload = {
  sub: string; // usuarioId
  username: string;
  rol: "ADMINISTRADOR" | "ATLETA";
  atletaId?: string | null;
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(getSecretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = "rep_session";

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 días
};
