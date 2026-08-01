"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarioAtletaPage() {
  const [cursor, setCursor] = useState(new Date());
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);

  const inicioMes = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const finMes = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

  const cargar = useCallback(async () => {
    const [rEnt, rEv] = await Promise.all([fetch(`/api/entrenamientos`), fetch(`/api/eventos`)]);
    if (rEnt.ok) setAsignaciones((await rEnt.json()).asignaciones ?? []);
    if (rEv.ok) setEventos((await rEv.json()).eventos ?? []);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const celdas = useMemo(() => {
    const primerDiaSemana = inicioMes.getDay();
    const dias: Date[] = [];
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(new Date(inicioMes.getFullYear(), inicioMes.getMonth(), i - primerDiaSemana + 1));
    }
    for (let d = 1; d <= finMes.getDate(); d++) dias.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    while (dias.length % 7 !== 0) dias.push(new Date(dias[dias.length - 1].getTime() + 86400000));
    return dias;
  }, [cursor]);

  function itemsDelDia(fecha: Date) {
    const key = ymd(fecha);
    return {
      ents: asignaciones.filter((a) => a.entrenamiento.fecha.slice(0, 10) === key),
      evs: eventos.filter((e) => e.fecha.slice(0, 10) === key),
    };
  }

  return (
    <div>
      <Topbar titulo="Mi calendario" subtitulo="Entrenamientos y eventos" />
      <div className="p-6 lg:p-8">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-white">
              {MESES[cursor.getMonth()]} {cursor.getFullYear()}
            </h2>
            <div className="flex gap-2">
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
                <div key={i} className={`min-h-[92px] bg-base-dark p-2 ${!esDelMes ? "opacity-30" : ""}`}>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${esHoy ? "bg-brand-red text-white" : "text-gray-400"}`}>
                    {fecha.getDate()}
                  </span>
                  <div className="mt-1 space-y-1">
                    {ents.map((a) => (
                      <p key={a.id} className="truncate rounded bg-brand-blue/15 px-1.5 py-0.5 text-[10px] text-brand-blue-light">
                        {a.entrenamiento.titulo}
                      </p>
                    ))}
                    {evs.map((e) => (
                      <p key={e.id} className="flex items-center gap-1 truncate rounded bg-brand-red/15 px-1.5 py-0.5 text-[10px] text-brand-red-light">
                        <Trophy className="h-2.5 w-2.5 shrink-0" /> {e.titulo}
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
