"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, EstadoBadge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { formatearFecha, formatearDistancia } from "@/lib/utils";
import { CheckCircle2, Clock, Route, Heart, Upload, FileText } from "lucide-react";

export default function EntrenamientosAtletaPage() {
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState<Record<string, string>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const cargar = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/entrenamientos");
    if (res.ok) setAsignaciones((await res.json()).asignaciones ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function marcarComoRealizado(entrenamientoId: string) {
    await fetch(`/api/entrenamientos/${entrenamientoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "COMPLETADO" }),
    });
    cargar();
  }

  async function iniciar(entrenamientoId: string) {
    await fetch(`/api/entrenamientos/${entrenamientoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "EN_PROCESO" }),
    });
    cargar();
  }

  async function guardarComentario(entrenamientoId: string) {
    const comentarioAtleta = comentarios[entrenamientoId];
    if (!comentarioAtleta?.trim()) return;
    await fetch(`/api/entrenamientos/${entrenamientoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comentarioAtleta }),
    });
    cargar();
  }

  async function subirEvidencia(asignacionId: string, entrenamientoId: string, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("asignacionId", asignacionId);
    fd.append("entrenamientoId", entrenamientoId);
    await fetch("/api/upload", { method: "POST", body: fd });
    cargar();
  }

  return (
    <div>
      <Topbar titulo="Mis entrenamientos" subtitulo={`${asignaciones.length} asignados`} />

      <div className="space-y-4 p-6 lg:p-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="glass-card h-32 animate-pulse" />)
        ) : asignaciones.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-gray-400">Aún no tienes entrenamientos asignados.</p>
          </Card>
        ) : (
          asignaciones.map((a) => (
            <Card key={a.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-semibold text-white">{a.entrenamiento.titulo}</p>
                    <EstadoBadge estado={a.estado} />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{formatearFecha(a.entrenamiento.fecha)}</p>
                  {a.entrenamiento.descripcion && <p className="mt-2 text-sm text-gray-400">{a.entrenamiento.descripcion}</p>}

                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-400">
                    {a.entrenamiento.distanciaKm && (
                      <span className="flex items-center gap-1">
                        <Route className="h-3.5 w-3.5" /> {formatearDistancia(a.entrenamiento.distanciaKm)}
                      </span>
                    )}
                    {a.entrenamiento.duracionMin && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> {a.entrenamiento.duracionMin} min
                      </span>
                    )}
                    {a.entrenamiento.frecuenciaCardiaca && (
                      <span className="flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" /> {a.entrenamiento.frecuenciaCardiaca}
                      </span>
                    )}
                  </div>

                  {a.entrenamiento.indicaciones && (
                    <p className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-sm text-gray-400">
                      {a.entrenamiento.indicaciones}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:w-40">
                  {a.estado === "PENDIENTE" && (
                    <Button size="sm" variant="secondary" onClick={() => iniciar(a.entrenamiento.id)}>
                      Iniciar
                    </Button>
                  )}
                  {a.estado !== "COMPLETADO" && (
                    <Button size="sm" onClick={() => marcarComoRealizado(a.entrenamiento.id)}>
                      <CheckCircle2 className="h-3.5 w-3.5" /> Marcar realizado
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 border-t border-white/[0.06] pt-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Agregar comentario sobre este entrenamiento..."
                    value={comentarios[a.entrenamiento.id] ?? a.comentarioAtleta ?? ""}
                    onChange={(e) => setComentarios({ ...comentarios, [a.entrenamiento.id]: e.target.value })}
                    className="min-h-[44px]"
                  />
                  <Button variant="secondary" size="sm" onClick={() => guardarComentario(a.entrenamiento.id)}>
                    Guardar
                  </Button>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    ref={(el) => {
                      fileInputs.current[a.id] = el;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) subirEvidencia(a.id, a.entrenamiento.id, file);
                    }}
                  />
                  <Button variant="ghost" size="sm" onClick={() => fileInputs.current[a.id]?.click()}>
                    <Upload className="h-3.5 w-3.5" /> Subir evidencia
                  </Button>
                  {a.entrenamiento.archivos?.length > 0 && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <FileText className="h-3.5 w-3.5" /> {a.entrenamiento.archivos.length} archivo(s)
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
