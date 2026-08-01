import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// GET /api/mensajes?con=usuarioId  -> hilo de conversación
// GET /api/mensajes                -> lista de conversaciones (solo admin, una por atleta)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const con = req.nextUrl.searchParams.get("con");

  if (con) {
    const mensajes = await prisma.mensaje.findMany({
      where: {
        OR: [
          { emisorId: session.sub, receptorId: con },
          { emisorId: con, receptorId: session.sub },
        ],
      },
      orderBy: { creadoEn: "asc" },
      take: 200,
    });

    // Marcar como leídos los que me enviaron a mí
    await prisma.mensaje.updateMany({
      where: { emisorId: con, receptorId: session.sub, leido: false },
      data: { leido: true },
    });

    return NextResponse.json({ mensajes });
  }

  // Lista de conversaciones: para admin, todos los atletas; para atleta, el/los admin(es)
  if (session.rol === "ADMINISTRADOR") {
    const atletas = await prisma.atleta.findMany({
      select: { id: true, nombre: true, apellidos: true, usuarioId: true },
      orderBy: { nombre: "asc" },
    });
    const noLeidos = await prisma.mensaje.groupBy({
      by: ["emisorId"],
      where: { receptorId: session.sub, leido: false },
      _count: true,
    });
    const mapa = Object.fromEntries(noLeidos.map((n) => [n.emisorId, n._count]));
    return NextResponse.json({
      conversaciones: atletas.map((a) => ({
        usuarioId: a.usuarioId,
        nombre: `${a.nombre} ${a.apellidos}`,
        noLeidos: mapa[a.usuarioId] ?? 0,
      })),
    });
  }

  const admins = await prisma.usuario.findMany({
    where: { rol: { nombre: "ADMINISTRADOR" } },
    select: { id: true, username: true },
  });
  return NextResponse.json({
    conversaciones: admins.map((a) => ({ usuarioId: a.id, nombre: `Entrenador (${a.username})`, noLeidos: 0 })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.receptorId || !body?.contenido?.trim()) {
    return NextResponse.json({ error: "Falta destinatario o contenido" }, { status: 400 });
  }

  const mensaje = await prisma.mensaje.create({
    data: {
      emisorId: session.sub,
      receptorId: body.receptorId,
      contenido: body.contenido.trim().slice(0, 2000),
    },
  });

  await prisma.notificacion.create({
    data: {
      usuarioId: body.receptorId,
      tipo: "MENSAJE_NUEVO",
      titulo: "Nuevo mensaje",
      mensaje: mensaje.contenido.slice(0, 80),
      enlace: session.rol === "ADMINISTRADOR" ? "/atleta/mensajes" : "/admin/mensajes",
    },
  });

  return NextResponse.json({ mensaje }, { status: 201 });
}
