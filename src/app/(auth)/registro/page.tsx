"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { crearAtletaSchema, type CrearAtletaInput } from "@/lib/validations";
import { Input, Label, FieldError, Textarea } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, CheckCircle2, ArrowLeft } from "lucide-react";

export default function RegistroPage() {
  const [enviado, setEnviado] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
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
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "No se pudo enviar tu solicitud");
        return;
      }
      setEnviado(true);
    } catch {
      setServerError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm animate-fade-up text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
          <h1 className="mt-4 font-display text-2xl font-bold text-white">¡Solicitud enviada!</h1>
          <p className="mt-2 text-sm text-gray-400">
            Tu entrenador va a revisar tu registro. Te avisaremos en cuanto lo apruebe y ya podrás iniciar sesión.
          </p>
          <Link href="/login" className="btn-secondary mt-6 inline-flex">
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-4 py-10">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[120px]" />

      <div className="relative mx-auto w-full max-w-2xl animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red shadow-glow">
            <Zap className="h-6 w-6 text-white" fill="white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Únete al equipo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Llena tus datos. Tu entrenador va a revisar y aprobar tu acceso.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="glass-card space-y-4 p-6">
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
              <Label>Usuario que quieres usar</Label>
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
            <Label>Observaciones médicas (opcional)</Label>
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
            {loading ? "Enviando..." : "Enviar solicitud"}
          </Button>
        </form>

        <Link href="/login" className="mt-6 flex items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" />
          Ya tengo cuenta, iniciar sesión
        </Link>
      </div>
    </div>
  );
}
