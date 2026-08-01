import { prisma } from "@/lib/prisma";
import { requireAtleta } from "@/lib/session";
import { Topbar } from "@/components/layout/topbar";
import { Card, StatCard, EstadoBadge } from "@/components/ui/card";
import { Route, Clock, Dumbbell, Target } from "lucide-react";
import { formatearFecha, formatearDistancia } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AtletaDashboardPage() {
  const session = await requireAtleta();
  const atletaId = session.atletaId!;

  const atleta = await prisma.atleta.findUnique({
    where: { id: atletaId },
    include: { estadisticas: true },
  });

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const manana = new Date(hoy.getTime() + 86400000);

  const [entrenamientoHoy, proximo] = await Promise.all([
    prisma.asignacion.findFirst({
      where: { atletaId, entrenamiento: { fecha: { gte: hoy, lt: manana } } },
      include: { entrenamiento: true },
    }),
    prisma.asignacion.findFirst({
      where: { atletaId, entrenamiento: { fecha: { gte: manana } } },
      orderBy: { entrenamiento: { fecha: "asc" } },
      include: { entrenamiento: true },
    }),
  ]);

  const total = await prisma.asignacion.count({ where: { atletaId } });
  const completados = await prisma.asignacion.count({ where: { atletaId, estado: "COMPLETADO" } });
  const porcentaje = total > 0 ? Math.round((completados / total) * 100) : 0;

  return (
    <div>
      <Topbar titulo={`Hola, ${atleta?.nombre} 👋`} subtitulo="Este es tu resumen de hoy" />

      <div className="space-y-6 p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Completado" value={porcentaje} suffix="%" icon={Target} accent="red" />
          <StatCard
            label="Kilómetros acumulados"
            value={(atleta?.estadisticas?.kilometrosAcumulados ?? 0).toFixed(1)}
            icon={Route}
            accent="blue"
          />
          <StatCard label="Horas entrenadas" value={(atleta?.estadisticas?.horasEntrenadas ?? 0).toFixed(1)} icon={Clock} accent="neutral" />
          <StatCard label="Entrenamientos realizados" value={completados} icon={Dumbbell} accent="red" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-brand-red/20">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-red-light">Entrenamiento de hoy</p>
            {entrenamientoHoy ? (
              <>
                <p className="mt-2 font-display text-xl font-bold text-white">{entrenamientoHoy.entrenamiento.titulo}</p>
                <p className="mt-1 text-sm text-gray-400">{entrenamientoHoy.entrenamiento.descripcion}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-400">
                  {entrenamientoHoy.entrenamiento.distanciaKm && (
                    <span>{formatearDistancia(entrenamientoHoy.entrenamiento.distanciaKm)}</span>
                  )}
                  {entrenamientoHoy.entrenamiento.duracionMin && <span>{entrenamientoHoy.entrenamiento.duracionMin} min</span>}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <EstadoBadge estado={entrenamientoHoy.estado} />
                  <Link href="/atleta/entrenamientos" className="text-xs font-medium text-brand-red-light hover:underline">
                    Ver detalle →
                  </Link>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-500">No tienes entrenamiento asignado para hoy. Buen día de descanso 🧘</p>
            )}
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-blue-light">Próximo entrenamiento</p>
            {proximo ? (
              <>
                <p className="mt-2 font-display text-xl font-bold text-white">{proximo.entrenamiento.titulo}</p>
                <p className="mt-1 text-sm text-gray-400">{formatearFecha(proximo.entrenamiento.fecha)}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-500">Aún no tienes próximos entrenamientos asignados.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
