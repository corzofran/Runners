"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { iniciales } from "@/lib/utils";
import { Save, KeyRound } from "lucide-react";

export default function PerfilAtletaPage() {
  const [atleta, setAtleta] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((json) => {
        setAtleta(json.usuario?.atleta ?? null);
        setForm(json.usuario?.atleta ?? {});
      });
  }, []);

  async function guardar() {
    if (!atleta) return;
    const res = await fetch(`/api/atletas/${atleta.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telefono: form.telefono,
        ciudad: form.ciudad,
        objetivoDeportivo: form.objetivoDeportivo,
      }),
    });
    setMensaje(res.ok ? "Perfil actualizado." : "No se pudo guardar.");
  }

  if (!atleta) {
    return (
      <div>
        <Topbar titulo="Perfil" />
        <div className="p-8">
          <div className="glass-card h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Topbar titulo="Mi perfil" />
      <div className="space-y-6 p-6 lg:p-8">
        {mensaje && (
          <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/10 px-4 py-2.5 text-sm text-brand-blue-light">
            {mensaje}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-red/15 text-2xl font-bold text-brand-red-light">
              {iniciales(atleta.nombre, atleta.apellidos)}
            </div>
            <p className="mt-3 font-display text-lg font-semibold text-white">
              {atleta.nombre} {atleta.apellidos}
            </p>
            <span className="badge mt-2 bg-white/5 text-gray-300">{atleta.nivel}</span>
            <p className="mt-4 text-sm text-gray-500">{atleta.objetivoDeportivo}</p>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="mb-4 font-display text-lg font-semibold text-white">Datos de contacto</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Teléfono</Label>
                <Input value={form.telefono ?? ""} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
              </div>
              <div>
                <Label>Ciudad</Label>
                <Input value={form.ciudad ?? ""} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Objetivo deportivo</Label>
                <Textarea
                  value={form.objetivoDeportivo ?? ""}
                  onChange={(e) => setForm({ ...form, objetivoDeportivo: e.target.value })}
                />
              </div>
            </div>
            <Button className="mt-4" onClick={guardar}>
              <Save className="h-4 w-4" /> Guardar cambios
            </Button>
          </Card>
        </div>

        <Card>
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-white">
            <KeyRound className="h-4 w-4" /> Seguridad
          </h2>
          <p className="text-sm text-gray-500">
            Si necesitas cambiar tu contraseña, contacta a tu entrenador — él puede asignarte una nueva
            desde el panel de administración de forma segura.
          </p>
        </Card>
      </div>
    </div>
  );
}
