"use client";

import { Search, Bell } from "lucide-react";
import { useState } from "react";

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
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.08]">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-red" />
        </button>
      </div>
    </header>
  );
}
