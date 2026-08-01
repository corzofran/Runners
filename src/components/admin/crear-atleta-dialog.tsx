"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearAtletaSchema, type CrearAtletaInput } from "@/lib/validations";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function CrearAtletaDialog({ onCreado }: { onCreado: () => void }) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CrearAtletaInput>({
    resolver: zodResolver(crearAtletaSchema),
    defaultValues: { nivel: "PRINCIPIANTE" },
  });

  async function onSubmit(data: CrearAtletaInput) {
    setServerError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/atletas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "No se pudo crear el atleta");
        return;
      }
      reset();
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
          <UserPlus className="h-4 w-4" />
          Nuevo atleta
        </Button>
      </DialogTrigger>
      <DialogContent title="Crear atleta" description="Se generará su acceso a la plataforma" className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="rounded-xl border border-brand-red/20 bg-brand-red/10 px-3 py-2 text-sm text-brand-red-light">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nombre</Label>
              <Input {...register("nombre")} placeholder="Ana" />
              <FieldError message={errors.nombre?.message} />
            </div>
            <div>
              <Label>Apellidos</Label>
              <Input {...register("apellidos")} placeholder="López García" />
              <FieldError message={errors.apellidos?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Usuario de acceso</Label>
              <Input {...register("username")} placeholder="ana.lopez" />
              <FieldError message={errors.username?.message} />
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input {...register("password")} type="password" placeholder="Mínimo 8 caracteres" />
              <FieldError message={errors.password?.message} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Correo</Label>
              <Input {...register("correo")} placeholder="ana@correo.com" />
              <FieldError message={errors.correo?.message} />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input {...register("telefono")} placeholder="961 123 4567" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Edad</Label>
              <Input {...register("edad")} type="number" placeholder="24" />
            </div>
            <div>
              <Label>Peso (kg)</Label>
              <Input {...register("pesoKg")} type="number" step="0.1" placeholder="58.5" />
            </div>
            <div>
              <Label>Estatura (cm)</Label>
              <Input {...register("estaturaCm")} type="number" step="0.1" placeholder="165" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sexo</Label>
              <Select onValueChange={(v) => setValue("sexo", v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MASCULINO">Masculino</SelectItem>
                  <SelectItem value="FEMENINO">Femenino</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nivel</Label>
              <Select defaultValue="PRINCIPIANTE" onValueChange={(v) => setValue("nivel", v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRINCIPIANTE">Principiante</SelectItem>
                  <SelectItem value="INTERMEDIO">Intermedio</SelectItem>
                  <SelectItem value="AVANZADO">Avanzado</SelectItem>
                  <SelectItem value="ELITE">Élite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Ciudad</Label>
            <Input {...register("ciudad")} placeholder="Tuxtla Gutiérrez" />
          </div>

          <div>
            <Label>Objetivo deportivo</Label>
            <Input {...register("objetivoDeportivo")} placeholder="Correr un 10K en menos de 45 min" />
          </div>

          <div>
            <Label>Observaciones médicas</Label>
            <Textarea {...register("observacionesMedicas")} placeholder="Lesiones previas, alergias, etc." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Contacto de emergencia</Label>
              <Input {...register("contactoEmergenciaNombre")} placeholder="Nombre" />
            </div>
            <div>
              <Label>Teléfono de emergencia</Label>
              <Input {...register("contactoEmergenciaTelefono")} placeholder="961 000 0000" />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Crear atleta"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
