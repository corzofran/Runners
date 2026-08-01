"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearEventoSchema, type CrearEventoInput } from "@/lib/validations";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Trophy, Users, Flag } from "lucide-react";
import { formatearFecha } from "@/lib/utils";

const tipoIcono: Record<string, any> = {
  CARRERA: Flag,
  COMPETENCIA: Trophy,
  ENTRENAMIENTO_GRUPAL: Users,
  JUNTA: Users,
};
const tipoLabel: Record<string, string> = {
  CARRERA: "Carrera",
  COMPETENCIA: "Competencia",
  ENTRENAMIENTO_GRUPAL: "Entrenamiento grupal",
  JUNTA: "Junta",
};

export default function EventosPage() {
  const [eventos, setEventos] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const cargar = useCallback(async () => {
    const res = await fetch("/api/eventos");
    if (res.ok) setEventos((await res.json()).eventos ?? []);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CrearEventoInput>({ resolver: zodResolver(crearEventoSchema) });

  async function onSubmit(data: CrearEventoInput) {
    const res = await fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      reset();
      setOpen(false);
      cargar();
    }
  }

  return (
    <div>
      <Topbar titulo="Eventos" subtitulo="Carreras, competencias y juntas" />

      <div className="p-6 lg:p-8">
        <div className="mb-5 flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" /> Nuevo evento
              </Button>
            </DialogTrigger>
            <DialogContent title="Crear evento">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input {...register("titulo")} placeholder="Carrera 5K Copoya" />
                  <FieldError message={errors.titulo?.message} />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select onValueChange={(v) => setValue("tipo", v as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CARRERA">Carrera</SelectItem>
                      <SelectItem value="COMPETENCIA">Competencia</SelectItem>
                      <SelectItem value="ENTRENAMIENTO_GRUPAL">Entrenamiento grupal</SelectItem>
                      <SelectItem value="JUNTA">Junta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError message={errors.tipo?.message} />
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
                <div>
                  <Label>Lugar</Label>
                  <Input {...register("lugar")} placeholder="Malecón, Tuxtla Gutiérrez" />
                </div>
                <div>
                  <Label>Descripción</Label>
                  <Textarea {...register("descripcion")} />
                </div>
                <Button type="submit" className="w-full">
                  Crear evento
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {eventos.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-gray-400">Sin eventos programados.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((e) => {
              const Icono = tipoIcono[e.tipo] ?? Trophy;
              return (
                <Card key={e.id}>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red-light">
                    <Icono className="h-5 w-5" />
                  </div>
                  <span className="badge bg-white/5 text-gray-400">{tipoLabel[e.tipo]}</span>
                  <p className="mt-2 font-display font-semibold text-white">{e.titulo}</p>
                  <p className="mt-1 text-sm text-gray-500">{formatearFecha(e.fecha)}</p>
                  {e.lugar && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5" /> {e.lugar}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
