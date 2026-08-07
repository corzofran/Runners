import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// Ranking visible para atletas: SOLO nombre, foto, racha y kilómetros.
// Nunca expone peso, observaciones médicas, teléfono, contacto de emergencia, etc.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const atletas = await prisma.atleta.findMany({
    where: { usuario: { estado: "ACTIVO" } },
    select: {
      id: true,
      nombre: true,
      apellidos: true,
      fotoUrl: true,
      estadisticas: {
        select: { rachaActual: true, rachaMaxima: true, kilometrosAcumulados: true, entrenamientosRealizados: true },
      },
    },
  });

  const ranking = atletas
    .map((a) => ({
      id: a.id,
      nombre: a.nombre,
      apellidos: a.apellidos,
      fotoUrl: a.fotoUrl,
      esYo: a.id === session.atletaId,
      rachaActual: a.estadisticas?.rachaActual ?? 0,
      rachaMaxima: a.estadisticas?.rachaMaxima ?? 0,
      kilometros: a.estadisticas?.kilometrosAcumulados ?? 0,
      entrenamientos: a.estadisticas?.entrenamientosRealizados ?? 0,
    }))
    .sort((a, b) => b.rachaActual - a.rachaActual || b.kilometros - a.kilometros);

  return NextResponse.json({ ranking });
}
