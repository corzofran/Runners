"use client";

import { useEffect, useState, useCallback } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { CrearAtletaDialog } from "@/components/admin/crear-atleta-dialog";
import { iniciales, formatearFecha } from "@/lib/utils";
import Link from "next/link";
import { MoreVertical, Ban, CheckCircle2, Trash2 } from "lucide-react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";

type Atleta = {
  id: string;
  nombre: string;
  apellidos: string;
  nivel: string;
  ciudad: string | null;
  fotoUrl: string | null;
  usuario: { username: string; estado: "ACTIVO" | "SUSPENDIDO"; ultimaConexion: string | null };
};

const nivelColor: Record<string, string> = {
  PRINCIPIANTE: "bg-white/5 text-gray-300",
  INTERMEDIO: "bg-brand-blue/10 text-brand-blue-light",
  AVANZADO: "bg-brand-red/10 text-brand-red-light",
  ELITE: "bg-amber-500/10 text-amber-400",
};

export default function AtletasPage() {
  const [atletas, setAtletas] = useState<Atleta[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async (busqueda = "") => {
    setLoading(true);
    const res = await fetch(`/api/atletas${busqueda ? `?q=${encodeURIComponent(busqueda)}` : ""}`);
    if (res.ok) {
      const json = await res.json();
      setAtletas(json.atletas);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  async function toggleEstado(id: string, accion: "suspender" | "reactivar") {
    await fetch(`/api/atletas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion }),
    });
    cargar(q);
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este atleta permanentemente? Esta acción no se puede deshacer.")) return;
    await fetch(`/api/atletas/${id}`, { method: "DELETE" });
    cargar(q);
  }

  return (
    <div>
      <Topbar
        titulo="Atletas"
        subtitulo={`${atletas.length} en tu equipo`}
        onBuscar={(v) => {
          setQ(v);
          cargar(v);
        }}
        placeholderBusqueda="Buscar por nombre o ciudad..."
      />

      <div className="p-6 lg:p-8">
        <div className="mb-5 flex justify-end">
          <CrearAtletaDialog onCreado={() => cargar(q)} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card h-40 animate-pulse" />
            ))}
          </div>
        ) : atletas.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-gray-400">Aún no tienes atletas registrados.</p>
            <p className="mt-1 text-sm text-gray-600">Crea el primero con el botón de arriba.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {atletas.map((a) => (
              <Card key={a.id} className="relative">
                <div className="absolute right-4 top-4">
                  <Dropdown.Root>
                    <Dropdown.Trigger className="rounded-lg p-1.5 text-gray-500 hover:bg-white/10 hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Dropdown.Trigger>
                    <Dropdown.Portal>
                      <Dropdown.Content className="z-50 min-w-[180px] rounded-xl border border-white/10 bg-base-surface p-1 shadow-glass">
                        {a.usuario.estado === "ACTIVO" ? (
                          <Dropdown.Item
                            onClick={() => toggleEstado(a.id, "suspender")}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none hover:bg-white/10"
                          >
                            <Ban className="h-4 w-4" /> Suspender
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item
                            onClick={() => toggleEstado(a.id, "reactivar")}
                            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-emerald-400 outline-none hover:bg-white/10"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Reactivar
                          </Dropdown.Item>
                        )}
                        <Dropdown.Item
                          onClick={() => eliminar(a.id)}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-red-light outline-none hover:bg-white/10"
                        >
                          <Trash2 className="h-4 w-4" /> Eliminar
                        </Dropdown.Item>
                      </Dropdown.Content>
                    </Dropdown.Portal>
                  </Dropdown.Root>
                </div>

                <Link href={`/admin/atletas/${a.id}`} className="block">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-red/15 text-sm font-bold text-brand-red-light">
                      {iniciales(a.nombre, a.apellidos)}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {a.nombre} {a.apellidos}
                      </p>
                      <p className="text-xs text-gray-500">@{a.usuario.username}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className={`badge ${nivelColor[a.nivel]}`}>{a.nivel}</span>
                    {a.usuario.estado === "SUSPENDIDO" && <span className="badge bg-brand-red/15 text-brand-red-light">Suspendido</span>}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>{a.ciudad ?? "Sin ciudad"}</span>
                    <span>
                      {a.usuario.ultimaConexion ? `Activo ${formatearFecha(a.usuario.ultimaConexion)}` : "Sin conexión"}
                    </span>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
