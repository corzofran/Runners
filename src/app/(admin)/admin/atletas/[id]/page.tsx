"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/topbar";
import { Card, EstadoBadge } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { iniciales, formatearFecha } from "@/lib/utils";
import { ArrowLeft, Save, KeyRound } from "lucide-react";
import Link from "next/link";

export default function AtletaDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [atleta, setAtleta] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [guardando, setGuardando] = useState(false);
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/atletas/${id}`)
      .then((r) => r.json())
      .then((json) => {
        setAtleta(json.atleta);
        setForm(json.atleta ?? {});
      });
  }, [id]);

  async function guardar() {
    setGuardando(true);
    setMensaje(null);
    const res = await fetch(`/api/atletas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setGuardando(false);
    setMensaje(res.ok ? "Cambios guardados." : "Ocurrió un error al guardar.");
  }

  async function cambiarPassword() {
    if (nuevaPassword.length < 8) {
      setMensaje("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    const res = await fetch(`/api/atletas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevaPassword }),
    });
    setMensaje(res.ok ? "Contraseña actualizada." : "No se pudo actualizar la contraseña.");
    setNuevaPassword("");
  }

  if (!atleta) {
    return (
      <div>
        <Topbar titulo="Cargando..." />
        <div className="p-8">
          <div className="glass-card h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar titulo={`${atleta.nombre} ${atleta.apellidos}`} subtitulo={`@${atleta.usuario.username}`} />

      <div className="space-y-6 p-6 lg:p-8">
        <Link href="/admin/atletas" className="flex w-fit items-center gap-1.5 text-sm text-gray-500 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver a atletas
        </Link>

        {mensaje && (
          <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-4 py-2.5 text-sm text-brand-blue-light">
            {mensaje}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="flex flex-col items-center text-center lg:col-span-1">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-red/15 text-2xl font-bold text-brand-red-light">
              {iniciales(atleta.nombre, atleta.apellidos)}
            </div>
            <p className="mt-3 font-display text-lg font-semibold text-white">
              {atleta.nombre} {atleta.apellidos}
            </p>
            <p className="text-sm text-gray-500">{atleta.ciudad ?? "Sin ciudad"}</p>
            <span className="badge mt-3 bg-white/5 text-gray-300">{atleta.nivel}</span>

            <div className="mt-6 w-full space-y-2 border-t border-white/[0.06] pt-4 text-left text-sm">
              <p className="flex justify-between text-gray-400">
                <span>Kilómetros</span>
                <span className="text-white">{atleta.estadisticas?.kilometrosAcumulados ?? 0} km</span>
              </p>
              <p className="flex justify-between text-gray-400">
                <span>Entrenamientos</span>
                <span className="text-white">{atleta.estadisticas?.entrenamientosRealizados ?? 0}</span>
              </p>
              <p className="flex justify-between text-gray-400">
                <span>Última conexión</span>
                <span className="text-white">
                  {atleta.usuario.ultimaConexion ? formatearFecha(atleta.usuario.ultimaConexion) : "—"}
                </span>
              </p>
            </div>

            <div className="mt-6 w-full space-y-2 border-t border-white/[0.06] pt-4 text-left">
              <Label className="flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5" /> Cambiar contraseña
              </Label>
              <Input
                type="password"
                value={nuevaPassword}
                onChange={(e) => setNuevaPassword(e.target.value)}
                placeholder="Nueva contraseña"
              />
              <Button variant="secondary" size="sm" className="w-full" onClick={cambiarPassword}>
                Actualizar contraseña
              </Button>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 font-display text-lg font-semibold text-white">Datos del atleta</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input value={form.nombre ?? ""} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <div>
                <Label>Apellidos</Label>
                <Input value={form.apellidos ?? ""} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} />
              </div>
              <div>
                <Label>Edad</Label>
                <Input
                  type="number"
                  value={form.edad ?? ""}
                  onChange={(e) => setForm({ ...form, edad: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Ciudad</Label>
                <Input value={form.ciudad ?? ""} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
              </div>
              <div>
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  value={form.pesoKg ?? ""}
                  onChange={(e) => setForm({ ...form, pesoKg: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Estatura (cm)</Label>
                <Input
                  type="number"
                  value={form.estaturaCm ?? ""}
                  onChange={(e) => setForm({ ...form, estaturaCm: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Nivel</Label>
                <Select value={form.nivel} onValueChange={(v) => setForm({ ...form, nivel: v })}>
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
              <div>
                <Label>Teléfono</Label>
                <Input value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Objetivo deportivo</Label>
                <Input
                  value={form.objetivoDeportivo ?? ""}
                  onChange={(e) => setForm({ ...form, objetivoDeportivo: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label>Observaciones médicas</Label>
                <Textarea
                  value={form.observacionesMedicas ?? ""}
                  onChange={(e) => setForm({ ...form, observacionesMedicas: e.target.value })}
                />
              </div>
            </div>

            <Button className="mt-5" onClick={guardar} disabled={guardando}>
              <Save className="h-4 w-4" />
              {guardando ? "Guardando..." : "Guardar cambios"}
            </Button>
          </Card>
        </div>

        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Entrenamientos recientes</h2>
          <div className="space-y-1">
            {atleta.asignaciones?.length === 0 && <p className="text-sm text-gray-500">Sin entrenamientos asignados aún.</p>}
            {atleta.asignaciones?.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-white/[0.05]">
                <div>
                  <p className="text-sm font-medium text-white">{a.entrenamiento.titulo}</p>
                  <p className="text-xs text-gray-500">{formatearFecha(a.entrenamiento.fecha)}</p>
                </div>
                <EstadoBadge estado={a.estado} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
