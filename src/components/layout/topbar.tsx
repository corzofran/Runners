"use client";

import { Search, Bell } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

type Notificacion = {
  id: string;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  leida: boolean;
  creadoEn: string;
};

function tiempoRelativo(fecha: string) {
  const diffMs = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.floor(horas / 24)} d`;
}

export function Topbar({
  titulo,
  subtitulo,
  onBuscar,
  placeholderBusqueda = "Buscar...",
}: {
  titulo: string;
  subtitulo?: string;
  onBuscar?: (valor: string) => void;
  placeholderBusqueda?: string;
}) {
  const [q, setQ] = useState("");
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const cargar = useCallback(async () => {
    const res = await fetch("/api/notificaciones");
    if (res.ok) {
      const json = await res.json();
      setNotificaciones(json.notificaciones ?? []);
      setNoLeidas(json.noLeidas ?? 0);
    }
  }, []);

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 20000);
    return () => clearInterval(t);
  }, [cargar]);

  async function marcarTodasLeidas() {
    await fetch("/api/notificaciones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ marcarTodasLeidas: true }),
    });
    cargar();
  }

  async function abrirNotificacion(n: Notificacion) {
    if (!n.leida) {
      await fetch("/api/notificaciones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });
      cargar();
    }
    setOpen(false);
    if (n.enlace) router.push(n.enlace);
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-base-black/70 px-6 py-5 backdrop-blur-xl lg:pl-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{titulo}</h1>
        {subtitulo && <p className="mt-0.5 text-sm text-gray-500">{subtitulo}</p>}
      </div>

      <div className="flex items-center gap-3">
        {onBuscar && (
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                onBuscar(e.target.value);
              }}
              placeholder={placeholderBusqueda}
              className="input-field w-64 pl-9"
            />
          </div>
        )}

        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.08]">
              <Bell className="h-[18px] w-[18px]" />
              {noLeidas > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-red" />}
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              className="z-50 w-80 overflow-hidden rounded-2xl border border-white/10 bg-base-surface shadow-glass"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <p className="text-sm font-semibold text-white">Notificaciones</p>
                {noLeidas > 0 && (
                  <button onClick={marcarTodasLeidas} className="text-xs text-brand-red-light hover:underline">
                    Marcar todas leídas
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <p className="p-6 text-center text-sm text-gray-500">No tienes notificaciones.</p>
                ) : (
                  notificaciones.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => abrirNotificacion(n)}
                      className={cn(
                        "flex w-full flex-col items-start gap-0.5 border-b border-white/[0.04] px-4 py-3 text-left transition-colors hover:bg-white/[0.05]",
                        !n.leida && "bg-brand-red/[0.04]"
                      )}
                    >
                      <div className="flex w-full items-center gap-2">
                        {!n.leida && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-red" />}
                        <p className="text-sm font-medium text-white">{n.titulo}</p>
                      </div>
                      <p className="line-clamp-2 text-xs text-gray-400">{n.mensaje}</p>
                      <p className="text-[10px] text-gray-600">{tiempoRelativo(n.creadoEn)}</p>
                    </button>
                  ))
                )}
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </header>
  );
}
