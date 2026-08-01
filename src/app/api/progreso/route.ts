import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAtleta } from "@/lib/session";

export async function GET() {
  let session;
  try {
    session = await requireAtleta();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const desde = new Date();
  desde.setDate(desde.getDate() - 84); // últimas 12 semanas

  const registros = await prisma.progreso.findMany({
    where: { atletaId: session.atletaId!, fecha: { gte: desde } },
    orderBy: { fecha: "asc" },
  });

  // Agrupar por semana (lunes como inicio)
  const semanas = new Map<string, { semana: string; km: number; minutos: number; entrenamientos: number }>();
  for (const r of registros) {
    const d = new Date(r.fecha);
    const diaSemana = (d.getDay() + 6) % 7; // lunes = 0
    const lunes = new Date(d);
    lunes.setDate(d.getDate() - diaSemana);
    const key = lunes.toISOString().slice(0, 10);
    const label = `${lunes.getDate()}/${lunes.getMonth() + 1}`;
    const actual = semanas.get(key) ?? { semana: label, km: 0, minutos: 0, entrenamientos: 0 };
    actual.km += r.kilometros;
    actual.minutos += r.tiempoMin;
    actual.entrenamientos += 1;
    semanas.set(key, actual);
  }

  const estadisticas = await prisma.estadistica.findUnique({ where: { atletaId: session.atletaId! } });

  return NextResponse.json({
    semanal: Array.from(semanas.values()),
    estadisticas,
  });
}
