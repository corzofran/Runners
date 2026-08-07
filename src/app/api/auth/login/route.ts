import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession, SESSION_COOKIE, cookieOptions } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "local";
  const rate = checkRateLimit(`login:${ip}`, 5, 60_000); // 5 intentos por minuto por IP
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Intenta de nuevo en un minuto." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { username, password } = parsed.data;

  const usuario = await prisma.usuario.findUnique({
    where: { username },
    include: { rol: true, atleta: true },
  });

  // Mensaje genérico intencional: no revela si el usuario existe o no.
  const credencialesInvalidas = () =>
    NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });

  if (!usuario) return credencialesInvalidas();

  if (usuario.estado === "SUSPENDIDO") {
    return NextResponse.json(
      { error: "Esta cuenta ha sido suspendida. Contacta a tu entrenador." },
      { status: 403 }
    );
  }

  if (usuario.estado === "PENDIENTE") {
    return NextResponse.json(
      { error: "Tu registro está pendiente de aprobación por tu entrenador. Te avisaremos cuando esté listo." },
      { status: 403 }
    );
  }

  if (usuario.estado === "RECHAZADO") {
    return NextResponse.json(
      { error: "Tu solicitud de registro no fue aprobada. Contacta a tu entrenador para más información." },
      { status: 403 }
    );
  }

  const passwordOk = await verifyPassword(password, usuario.passwordHash);
  if (!passwordOk) return credencialesInvalidas();

  const token = await signSession({
    sub: usuario.id,
    username: usuario.username,
    rol: usuario.rol.nombre,
    atletaId: usuario.atleta?.id ?? null,
  });

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { ultimaConexion: new Date() },
  });

  const res = NextResponse.json({
    ok: true,
    rol: usuario.rol.nombre,
    redirect: usuario.rol.nombre === "ADMINISTRADOR" ? "/admin/dashboard" : "/atleta/dashboard",
  });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions);
  return res;
}
