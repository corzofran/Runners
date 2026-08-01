import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const entrenamiento = await prisma.entrenamiento.findUnique({
    where: { id: params.id },
    include: { asignaciones: { include: { atleta: true } }, archivos: true },
  });
  if (!entrenamiento) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json({ entrenamiento });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json().catch(() => null);

  // Duplicar
  if (body?.accion === "duplicar") {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const original = await prisma.entrenamiento.findUnique({
      where: { id: params.id },
      include: { asignaciones: true },
    });
    if (!original) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

    const copia = await prisma.entrenamiento.create({
      data: {
        titulo: `${original.titulo} (copia)`,
        descripcion: original.descripcion,
        objetivo: original.objetivo,
        fecha: original.fecha,
        hora: original.hora,
        duracionMin: original.duracionMin,
        distanciaKm: original.distanciaKm,
        ritmoObjetivo: original.ritmoObjetivo,
        frecuenciaCardiaca: original.frecuenciaCardiaca,
        series: original.series,
        repeticiones: original.repeticiones,
        descansoSeg: original.descansoSeg,
        indicaciones: original.indicaciones,
        notasEntrenador: original.notasEntrenador,
        creadoPorId: session.sub,
        asignaciones: { create: original.asignaciones.map((a) => ({ atletaId: a.atletaId })) },
      },
    });
    return NextResponse.json({ entrenamiento: copia }, { status: 201 });
  }

  // Reprogramar (drag & drop en calendario) — permitido solo a admin
  if (body?.fecha && Object.keys(body).length <= 2) {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    const entrenamiento = await prisma.entrenamiento.update({
      where: { id: params.id },
      data: { fecha: new Date(body.fecha), hora: body.hora ?? undefined },
    });
    return NextResponse.json({ entrenamiento });
  }

  // Atleta marca su asignación (estado / comentario) vía este mismo endpoint por conveniencia
  if (session.rol === "ATLETA" && (body?.estado || body?.comentarioAtleta)) {
    const asignacion = await prisma.asignacion.findUnique({
      where: { entrenamientoId_atletaId: { entrenamientoId: params.id, atletaId: session.atletaId! } },
    });
    if (!asignacion) return NextResponse.json({ error: "Asignación no encontrada" }, { status: 404 });

    const actualizada = await prisma.asignacion.update({
      where: { id: asignacion.id },
      data: {
        estado: body.estado ?? undefined,
        comentarioAtleta: body.comentarioAtleta ?? undefined,
        completadoEn: body.estado === "COMPLETADO" ? new Date() : undefined,
      },
    });

    if (body.estado === "COMPLETADO" && asignacion.estado !== "COMPLETADO") {
      const ent = await prisma.entrenamiento.findUnique({ where: { id: params.id } });
      await prisma.$transaction([
        prisma.estadistica.update({
          where: { atletaId: session.atletaId! },
          data: {
            entrenamientosRealizados: { increment: 1 },
            kilometrosAcumulados: { increment: ent?.distanciaKm ?? 0 },
            horasEntrenadas: { increment: (ent?.duracionMin ?? 0) / 60 },
          },
        }),
        prisma.progreso.create({
          data: {
            atletaId: session.atletaId!,
            fecha: ent?.fecha ?? new Date(),
            kilometros: ent?.distanciaKm ?? 0,
            tiempoMin: ent?.duracionMin ?? 0,
            ritmoPromedio: ent?.ritmoObjetivo,
            asistio: true,
          },
        }),
      ]);
    }

    return NextResponse.json({ asignacion: actualizada });
  }

  // Edición completa (admin)
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const entrenamiento = await prisma.entrenamiento.update({
    where: { id: params.id },
    data: {
      titulo: body.titulo,
      descripcion: body.descripcion,
      objetivo: body.objetivo,
      fecha: body.fecha ? new Date(body.fecha) : undefined,
      hora: body.hora,
      duracionMin: body.duracionMin,
      distanciaKm: body.distanciaKm,
      ritmoObjetivo: body.ritmoObjetivo,
      frecuenciaCardiaca: body.frecuenciaCardiaca,
      series: body.series,
      repeticiones: body.repeticiones,
      descansoSeg: body.descansoSeg,
      indicaciones: body.indicaciones,
      notasEntrenador: body.notasEntrenador,
    },
  });

  // Notificar cambio a los atletas asignados
  const asignados = await prisma.asignacion.findMany({
    where: { entrenamientoId: params.id },
    include: { atleta: { select: { usuarioId: true } } },
  });
  await prisma.notificacion.createMany({
    data: asignados.map((a) => ({
      usuarioId: a.atleta.usuarioId,
      tipo: "ENTRENAMIENTO_MODIFICADO" as const,
      titulo: "Entrenamiento actualizado",
      mensaje: `Se modificó: ${entrenamiento.titulo}`,
      enlace: `/atleta/entrenamientos`,
    })),
  });

  return NextResponse.json({ entrenamiento });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  await prisma.entrenamiento.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
