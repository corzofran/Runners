"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearEntrenamientoSchema, type CrearEntrenamientoInput } from "@/lib/validations";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";

type AtletaMini = { id: string; nombre: string; apellidos: string };

export function CrearEntrenamientoDialog({
  onCreado,
  fechaInicial,
}: {
  onCreado: () => void;
  fechaInicial?: string;
}) {
  const [open, setOpen] = useState(false);
  const [atletas, setAtletas] = useState<AtletaMini[]>([]);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [todoElEquipo, setTodoElEquipo] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CrearEntrenamientoInput>({
    resolver: zodResolver(crearEntrenamientoSchema),
    defaultValues: { fecha: fechaInicial, atletaIds: [] },
  });

  useEffect(() => {
    if (open) {
      fetch("/api/atletas")
        .then((r) => r.json())
        .then((json) => setAtletas(json.atletas ?? []));
    }
  }, [open]);

  function toggleAtleta(id: string) {
    setSeleccionados((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setValue("atletaIds", next);
      return next;
    });
  }

  function toggleTodoElEquipo() {
    setTodoElEquipo((prev) => {
      const next = !prev;
      setValue("atletaIds", next ? ["TODO_EL_EQUIPO"] : []);
      setSeleccionados([]);
      return next;
    });
  }

  async function onSubmit(data: CrearEntrenamientoInput) {
    setServerError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/entrenamientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "No se pudo crear el entrenamiento");
        return;
      }
      reset();
      setSeleccionados([]);
      setTodoElEquipo(false);
      setOpen(false);
      onCreado();
    } catch {
      setServerError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nuevo entrenamiento
        </Button>
      </DialogTrigger>
      <DialogContent title="Crear entrenamiento" description="Personaliza cada detalle de la sesión" className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red-light">
              {serverError}
            </div>
          )}

          <div>
            <Label>Título</Label>
            <Input {...register("titulo")} placeholder="Fartlek 8x400m" />
            <FieldError message={errors.titulo?.message} />
          </div>

          <div>
            <Label>Descripción</Label>
            <Textarea {...register("descripcion")} placeholder="Calentamiento, bloque principal, enfriamiento..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Fecha</Label>
              <Input type="date" {...register("fecha")} />
              <FieldError message={errors.fecha?.message} />
            </div>
            <div>
              <Label>Hora</Label>
              <Input type="time" {...register("hora")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Duración (min)</Label>
              <Input type="number" {...register("duracionMin")} placeholder="60" />
            </div>
            <div>
              <Label>Distancia (km)</Label>
              <Input type="number" step="0.1" {...register("distanciaKm")} placeholder="8" />
            </div>
            <div>
              <Label>Ritmo objetivo</Label>
              <Input {...register("ritmoObjetivo")} placeholder="4:30 min/km" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Series</Label>
              <Input type="number" {...register("series")} placeholder="8" />
            </div>
            <div>
              <Label>Repeticiones</Label>
              <Input type="number" {...register("repeticiones")} placeholder="1" />
            </div>
            <div>
              <Label>Descanso (seg)</Label>
              <Input type="number" {...register("descansoSeg")} placeholder="90" />
            </div>
          </div>

          <div>
            <Label>Frecuencia cardíaca objetivo</Label>
            <Input {...register("frecuenciaCardiaca")} placeholder="Zona 3 (150-165 bpm)" />
          </div>

          <div>
            <Label>Indicaciones</Label>
            <Textarea {...register("indicaciones")} placeholder="Notas técnicas para el atleta" />
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Asignar a
            </Label>
            <button
              type="button"
              onClick={toggleTodoElEquipo}
              className={`mb-2 w-full rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                todoElEquipo
                  ? "border-brand-red/40 bg-brand-red/10 text-brand-red-light"
                  : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.06]"
              }`}
            >
              Todo el equipo ({atletas.length} atletas)
            </button>

            {!todoElEquipo && (
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-white/10 p-2">
                {atletas.length === 0 && <p className="p-2 text-sm text-gray-500">No hay atletas registrados.</p>}
                {atletas.map((a) => (
                  <button
                    type="button"
                    key={a.id}
                    onClick={() => toggleAtleta(a.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      seleccionados.includes(a.id) ? "bg-brand-blue/15 text-brand-blue-light" : "text-gray-300 hover:bg-white/[0.06]"
                    }`}
                  >
                    {a.nombre} {a.apellidos}
                    {seleccionados.includes(a.id) && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
            <FieldError message={errors.atletaIds?.message as string | undefined} />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Crear y asignar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
