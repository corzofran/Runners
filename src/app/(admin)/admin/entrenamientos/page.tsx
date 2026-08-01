"use client";

import { useEffect, useState, useCallback } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CrearEntrenamientoDialog } from "@/components/admin/crear-entrenamiento-dialog";
import { formatearFecha, formatearDistancia } from "@/lib/utils";
import { Copy, Trash2, Users, Clock, Route } from "lucide-react";

export default function EntrenamientosPage() {
  const [entrenamientos, setEntrenamientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/entrenamientos");
    if (res.ok) {
      const json = await res.json();
      setEntrenamientos(json.entrenamientos ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function duplicar(id: string) {
    await fetch(`/api/entrenamientos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "duplicar" }),
    });
    cargar();
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este entrenamiento? Se quitará de todos los atletas asignados.")) return;
    await fetch(`/api/entrenamientos/${id}`, { method: "DELETE" });
    cargar();
  }

  return (
    <div>
      <Topbar titulo="Entrenamientos" subtitulo={`${entrenamientos.length} creados`} />

      <div className="p-6 lg:p-8">
        <div className="mb-5 flex justify-end">
          <CrearEntrenamientoDialog onCreado={cargar} />
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card h-24 animate-pulse" />
            ))}
          </div>
        ) : entrenamientos.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-gray-400">Aún no has creado entrenamientos.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {entrenamientos.map((e) => {
              const completados = e.asignaciones?.filter((a: any) => a.estado === "COMPLETADO").length ?? 0;
              const total = e.asignaciones?.length ?? 0;
              return (
                <Card key={e.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-display font-semibold text-white">{e.titulo}</p>
                      <span className="badge bg-white/5 text-gray-400">{formatearFecha(e.fecha)}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {e.distanciaKm && (
                        <span className="flex items-center gap-1">
                          <Route className="h-3.5 w-3.5" /> {formatearDistancia(e.distanciaKm)}
                        </span>
                      )}
                      {e.duracionMin && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" /> {e.duracionMin} min
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" /> {completados}/{total} completados
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => duplicar(e.id)}>
                      <Copy className="h-3.5 w-3.5" /> Duplicar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => eliminar(e.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
