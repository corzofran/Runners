import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/session";
import { crearEntrenamientoSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const desde = req.nextUrl.searchParams.get("desde");
  const hasta = req.nextUrl.searchParams.get("hasta");
  const atletaIdFiltro = req.nextUrl.searchParams.get("atletaId");

  const rangoFecha =
    desde || hasta
      ? { fecha: { gte: desde ? new Date(desde) : undefined, lte: hasta ? new Date(hasta) : undefined } }
      : {};

  if (session.rol === "ADMINISTRADOR") {
    const entrenamientos = await prisma.entrenamiento.findMany({
      where: {
        ...rangoFecha,
        ...(atletaIdFiltro ? { asignaciones: { some: { atletaId: atletaIdFiltro } } } : {}),
      },
      include: {
        asignaciones: { include: { atleta: { select: { id: true, nombre: true, apellidos: true, fotoUrl: true } } } },
        archivos: true,
      },
      orderBy: { fecha: "asc" },
    });
    return NextResponse.json({ entrenamientos });
  }

  // Atleta: solo ve lo asignado a él
  if (!session.atletaId) return NextResponse.json({ entrenamientos: [] });

  const asignaciones = await prisma.asignacion.findMany({
    where: {
      atletaId: session.atletaId,
      entrenamiento: rangoFecha,
    },
    include: { entrenamiento: { include: { archivos: true } } },
    orderBy: { entrenamiento: { fecha: "asc" } },
  });

  return NextResponse.json({ asignaciones });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const session = await getSession();

  const body = await req.json().catch(() => null);
  const parsed = crearEntrenamientoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const data = parsed.data;

  let atletaIds = data.atletaIds;
  if (atletaIds.length === 1 && atletaIds[0] === "TODO_EL_EQUIPO") {
    const todos = await prisma.atleta.findMany({ select: { id: true } });
    atletaIds = todos.map((a) => a.id);
  }

  const entrenamiento = await prisma.entrenamiento.create({
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion,
      objetivo: data.objetivo,
      fecha: new Date(data.fecha),
      hora: data.hora,
      duracionMin: data.duracionMin,
      distanciaKm: data.distanciaKm,
      ritmoObjetivo: data.ritmoObjetivo,
      frecuenciaCardiaca: data.frecuenciaCardiaca,
      series: data.series,
      repeticiones: data.repeticiones,
      descansoSeg: data.descansoSeg,
      indicaciones: data.indicaciones,
      notasEntrenador: data.notasEntrenador,
      creadoPorId: session!.sub,
      asignaciones: {
        create: atletaIds.map((atletaId) => ({ atletaId })),
      },
    },
    include: { asignaciones: true },
  });

  // Notificación para cada atleta asignado
  const atletasConUsuario = await prisma.atleta.findMany({
    where: { id: { in: atletaIds } },
    select: { usuarioId: true },
  });
  await prisma.notificacion.createMany({
    data: atletasConUsuario.map((a) => ({
      usuarioId: a.usuarioId,
      tipo: "ENTRENAMIENTO_NUEVO" as const,
      titulo: "Nuevo entrenamiento asignado",
      mensaje: `Se te asignó: ${entrenamiento.titulo}`,
      enlace: `/atleta/entrenamientos`,
    })),
  });

  return NextResponse.json({ entrenamiento }, { status: 201 });
}
