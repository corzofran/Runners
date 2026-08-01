"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CrearEntrenamientoDialog } from "@/components/admin/crear-entrenamiento-dialog";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarioAdminPage() {
  const [cursor, setCursor] = useState(new Date());
  const [entrenamientos, setEntrenamientos] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);

  const inicioMes = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const finMes = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

  const cargar = useCallback(async () => {
    const desde = ymd(new Date(inicioMes.getFullYear(), inicioMes.getMonth(), 1 - 7));
    const hasta = ymd(new Date(finMes.getFullYear(), finMes.getMonth(), finMes.getDate() + 7));
    const [rEnt, rEv] = await Promise.all([
      fetch(`/api/entrenamientos?desde=${desde}&hasta=${hasta}`),
      fetch(`/api/eventos`),
    ]);
    if (rEnt.ok) setEntrenamientos((await rEnt.json()).entrenamientos ?? []);
    if (rEv.ok) setEventos((await rEv.json()).eventos ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const celdas = useMemo(() => {
    const primerDiaSemana = inicioMes.getDay();
    const dias: Date[] = [];
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(new Date(inicioMes.getFullYear(), inicioMes.getMonth(), i - primerDiaSemana + 1));
    }
    for (let d = 1; d <= finMes.getDate(); d++) {
      dias.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (dias.length % 7 !== 0) {
      dias.push(new Date(dias[dias.length - 1].getTime() + 86400000));
    }
    return dias;
  }, [cursor]);

  function itemsDelDia(fecha: Date) {
    const key = ymd(fecha);
    const ents = entrenamientos.filter((e) => e.fecha.slice(0, 10) === key);
    const evs = eventos.filter((e) => e.fecha.slice(0, 10) === key);
    return { ents, evs };
  }

  return (
    <div>
      <Topbar titulo="Calendario" subtitulo="Vista mensual del equipo" />

      <div className="space-y-6 p-6 lg:p-8">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">
              {MESES[cursor.getMonth()]} {cursor.getFullYear()}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setCursor(new Date())}>
                Hoy
              </Button>
              <Button variant="secondary" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl bg-white/[0.06]">
            {DIAS.map((d) => (
              <div key={d} className="bg-base-dark py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                {d}
              </div>
            ))}
            {celdas.map((fecha, i) => {
              const { ents, evs } = itemsDelDia(fecha);
              const esDelMes = fecha.getMonth() === cursor.getMonth();
              const esHoy = ymd(fecha) === ymd(new Date());
              return (
                <button
                  key={i}
                  onClick={() => setDiaSeleccionado(ymd(fecha))}
                  className={`min-h-[92px] bg-base-dark p-2 text-left transition-colors hover:bg-white/[0.04] ${
                    !esDelMes ? "opacity-30" : ""
                  } ${diaSeleccionado === ymd(fecha) ? "ring-1 ring-inset ring-brand-red/50" : ""}`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      esHoy ? "bg-brand-red text-white" : "text-gray-400"
                    }`}
                  >
                    {fecha.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {ents.slice(0, 2).map((e) => (
                      <p key={e.id} className="truncate rounded bg-brand-blue/15 px-1.5 py-0.5 text-[10px] text-brand-blue-light">
                        {e.titulo}
                      </p>
                    ))}
                    {evs.slice(0, 1).map((e) => (
                      <p key={e.id} className="flex items-center gap-1 truncate rounded bg-brand-red/15 px-1.5 py-0.5 text-[10px] text-brand-red-light">
                        <Trophy className="h-2.5 w-2.5 shrink-0" /> {e.titulo}
                      </p>
                    ))}
                    {ents.length + evs.length > 3 && (
                      <p className="text-[10px] text-gray-500">+{ents.length + evs.length - 3} más</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {diaSeleccionado && (
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display font-semibold text-white">
                {new Date(diaSeleccionado + "T00:00:00").toLocaleDateString("es-MX", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <CrearEntrenamientoDialog onCreado={cargar} fechaInicial={diaSeleccionado} />
            </div>
            {(() => {
              const { ents, evs } = itemsDelDia(new Date(diaSeleccionado + "T00:00:00"));
              if (ents.length === 0 && evs.length === 0) {
                return <p className="text-sm text-gray-500">Sin entrenamientos ni eventos este día.</p>;
              }
              return (
                <div className="space-y-2">
                  {ents.map((e) => (
                    <div key={e.id} className="rounded-xl border border-white/[0.06] px-3 py-2.5">
                      <p className="text-sm font-medium text-white">{e.titulo}</p>
                      <p className="text-xs text-gray-500">{e.asignaciones?.length ?? 0} atletas asignados</p>
                    </div>
                  ))}
                  {evs.map((e) => (
                    <div key={e.id} className="flex items-center gap-2 rounded-xl border border-brand-red/20 bg-brand-red/5 px-3 py-2.5">
                      <Trophy className="h-4 w-4 text-brand-red-light" />
                      <p className="text-sm font-medium text-white">{e.titulo}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </Card>
        )}
      </div>
    </div>
  );
}
