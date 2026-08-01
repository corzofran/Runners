import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

// Rutas públicas que no requieren sesión
const PUBLIC_PATHS = ["/", "/login", "/recuperar-password"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/uploads");

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (isPublic) {
    // Si ya tiene sesión y visita /login, redirige a su dashboard
    if (pathname === "/login" && session) {
      return NextResponse.redirect(
        new URL(session.rol === "ADMINISTRADOR" ? "/admin/dashboard" : "/atleta/dashboard", req.url)
      );
    }
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protección por rol: nadie cruza al panel del otro rol
  if (pathname.startsWith("/admin") && session.rol !== "ADMINISTRADOR") {
    return NextResponse.redirect(new URL("/atleta/dashboard", req.url));
  }
  if (pathname.startsWith("/atleta") && session.rol !== "ATLETA") {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  // Adjunta identidad del usuario a headers internos para las API routes
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", session.sub);
  requestHeaders.set("x-user-rol", session.rol);
  if (session.atletaId) requestHeaders.set("x-atleta-id", session.atletaId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Aplica a todas las rutas excepto assets estáticos.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
