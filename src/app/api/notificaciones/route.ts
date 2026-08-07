import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const notificaciones = await prisma.notificacion.findMany({
    where: { usuarioId: session.sub },
    orderBy: { creadoEn: "desc" },
    take: 20,
  });
  const noLeidas = await prisma.notificacion.count({ where: { usuarioId: session.sub, leida: false } });

  return NextResponse.json({ notificaciones, noLeidas });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);

  if (body?.marcarTodasLeidas) {
    await prisma.notificacion.updateMany({
      where: { usuarioId: session.sub, leida: false },
      data: { leida: true },
    });
    return NextResponse.json({ ok: true });
  }

  if (body?.id) {
    await prisma.notificacion.updateMany({
      where: { id: body.id, usuarioId: session.sub },
      data: { leida: true },
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Falta especificar qué marcar como leído" }, { status: 400 });
}
