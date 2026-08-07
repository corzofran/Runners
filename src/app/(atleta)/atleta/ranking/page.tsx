"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { iniciales, formatearDistancia } from "@/lib/utils";
import { Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type Fila = {
  id: string;
  nombre: string;
  apellidos: string;
  fotoUrl: string | null;
  esYo: boolean;
  rachaActual: number;
  rachaMaxima: number;
  kilometros: number;
  entrenamientos: number;
};

const medalla = ["🥇", "🥈", "🥉"];

export default function RankingPage() {
  const [ranking, setRanking] = useState<Fila[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((json) => {
        setRanking(json.ranking ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <Topbar titulo="Ranking del equipo" subtitulo="Racha de días entrenando seguidos" />
      <div className="space-y-3 p-6 lg:p-8">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="glass-card h-16 animate-pulse" />)
        ) : ranking.length === 0 ? (
          <Card className="py-16 text-center">
            <p className="text-gray-400">Aún no hay actividad registrada en el equipo.</p>
          </Card>
        ) : (
          ranking.map((fila, i) => (
            <Card
              key={fila.id}
              className={cn(
                "flex items-center justify-between py-4",
                fila.esYo && "border-brand-red/30 bg-brand-red/[0.04]"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center text-lg font-bold text-gray-500">
                  {medalla[i] ?? `#${i + 1}`}
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue/15 text-sm font-bold text-brand-blue-light">
                  {iniciales(fila.nombre, fila.apellidos)}
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-white">
                    {fila.nombre} {fila.apellidos}
                    {fila.esYo && <span className="badge bg-brand-red/15 text-brand-red-light">Tú</span>}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatearDistancia(fila.kilometros)} · {fila.entrenamientos} entrenamientos
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Flame className={cn("h-5 w-5", fila.rachaActual > 0 ? "text-brand-red" : "text-gray-600")} />
                <span className="font-display text-xl font-bold text-white">{fila.rachaActual}</span>
                <span className="text-xs text-gray-500">días</span>
              </div>
            </Card>
          ))
        )}

        <p className="pt-2 text-center text-xs text-gray-600">
          <Trophy className="mr-1 inline h-3.5 w-3.5" />
          La racha se mantiene completando al menos un entrenamiento cada día.
        </p>
      </div>
    </div>
  );
}
