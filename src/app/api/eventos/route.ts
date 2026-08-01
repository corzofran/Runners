import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/session";
import { crearEventoSchema } from "@/lib/validations";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const eventos = await prisma.evento.findMany({ orderBy: { fecha: "asc" } });
  return NextResponse.json({ eventos });
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = crearEventoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.flatten() }, { status: 400 });
  }
  const data = parsed.data;

  const evento = await prisma.evento.create({
    data: {
      titulo: data.titulo,
      tipo: data.tipo,
      fecha: new Date(data.fecha),
      hora: data.hora,
      lugar: data.lugar,
      latitud: data.latitud,
      longitud: data.longitud,
      descripcion: data.descripcion,
      creadoPorId: session.sub,
    },
  });

  const todosLosAtletas = await prisma.atleta.findMany({ select: { usuarioId: true } });
  await prisma.notificacion.createMany({
    data: todosLosAtletas.map((a) => ({
      usuarioId: a.usuarioId,
      tipo: "EVENTO_NUEVO" as const,
      titulo: "Nuevo evento",
      mensaje: evento.titulo,
      enlace: `/atleta/calendario`,
    })),
  });

  return NextResponse.json({ evento }, { status: 201 });
}
