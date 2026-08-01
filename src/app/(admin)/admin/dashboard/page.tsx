import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/layout/topbar";
import { StatCard, Card, EstadoBadge } from "@/components/ui/card";
import { Users, Dumbbell, Activity, Trophy, ArrowUpRight } from "lucide-react";
import { formatearFecha, iniciales } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalAtletas, entrenamientosActivos, conectadosRecientes, proximosEventos, ultimosAtletas, entrenamientosRecientes] =
    await Promise.all([
      prisma.atleta.count(),
      prisma.entrenamiento.count({ where: { fecha: { gte: new Date() } } }),
      prisma.atleta.findMany({
        where: { usuario: { ultimaConexion: { not: null } } },
        orderBy: { usuario: { ultimaConexion: "desc" } },
        take: 5,
        include: { usuario: { select: { ultimaConexion: true } } },
      }),
      prisma.evento.findMany({ where: { fecha: { gte: new Date() } }, orderBy: { fecha: "asc" }, take: 4 }),
      prisma.atleta.findMany({ orderBy: { creadoEn: "desc" }, take: 5 }),
      prisma.entrenamiento.findMany({
        orderBy: { creadoEn: "desc" },
        take: 5,
        include: { asignaciones: { select: { estado: true } } },
      }),
    ]);

  const semanaInicio = new Date();
  semanaInicio.setDate(semanaInicio.getDate() - 7);
  const entrenamientosSemana = await prisma.asignacion.count({
    where: { creadoEn: { gte: semanaInicio } },
  });
  const completadosSemana = await prisma.asignacion.count({
    where: { creadoEn: { gte: semanaInicio }, estado: "COMPLETADO" },
  });

  return (
    <div>
      <Topbar titulo="Dashboard" subtitulo="Resumen general de tu equipo" />

      <div className="space-y-6 p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Atletas registrados" value={totalAtletas} icon={Users} accent="red" />
          <StatCard label="Entrenamientos activos" value={entrenamientosActivos} icon={Dumbbell} accent="blue" />
          <StatCard label="Conectados recientemente" value={conectadosRecientes.length} icon={Activity} accent="neutral" />
          <StatCard label="Próximos eventos" value={proximosEventos.length} icon={Trophy} accent="red" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Últimos atletas */}
          <Card className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-white">Últimos atletas registrados</h2>
              <Link href="/admin/atletas" className="flex items-center gap-1 text-xs font-medium text-brand-red-light hover:underline">
                Ver todos <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-1">
              {ultimosAtletas.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-500">
                  Aún no hay atletas. Crea el primero desde la sección Atletas.
                </p>
              )}
              {ultimosAtletas.map((a) => (
                <Link
                  key={a.id}
                  href={`/admin/atletas/${a.id}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue/15 text-xs font-bold text-brand-blue-light">
                      {iniciales(a.nombre, a.apellidos)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {a.nombre} {a.apellidos}
                      </p>
                      <p className="text-xs text-gray-500">{a.ciudad ?? "Sin ciudad registrada"}</p>
                    </div>
                  </div>
                  <span className="badge bg-white/5 text-gray-300">{a.nivel}</span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Próximos eventos */}
          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold text-white">Próximos eventos</h2>
            <div className="space-y-3">
              {proximosEventos.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">Sin eventos programados.</p>
              )}
              {proximosEventos.map((ev) => (
                <div key={ev.id} className="rounded-xl border border-white/[0.06] p-3">
                  <p className="text-sm font-medium text-white">{ev.titulo}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{formatearFecha(ev.fecha)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold text-white">Entrenamientos recientes</h2>
            <div className="space-y-1">
              {entrenamientosRecientes.length === 0 && (
                <p className="py-6 text-center text-sm text-gray-500">Aún no has creado entrenamientos.</p>
              )}
              {entrenamientosRecientes.map((e) => {
                const total = e.asignaciones.length;
                const completados = e.asignaciones.filter((a) => a.estado === "COMPLETADO").length;
                return (
                  <div key={e.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-white/[0.05]">
                    <div>
                      <p className="text-sm font-medium text-white">{e.titulo}</p>
                      <p className="text-xs text-gray-500">{formatearFecha(e.fecha)}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {completados}/{total} completados
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-lg font-semibold text-white">Resumen semanal</h2>
            <div className="flex items-center gap-8">
              <div>
                <p className="stat-number">{entrenamientosSemana}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">Asignados</p>
              </div>
              <div>
                <p className="stat-number text-brand-red">{completadosSemana}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">Completados</p>
              </div>
              <div>
                <p className="stat-number">
                  {entrenamientosSemana > 0 ? Math.round((completadosSemana / entrenamientosSemana) * 100) : 0}
                  <span className="text-lg text-gray-500">%</span>
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-gray-500">Cumplimiento</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
