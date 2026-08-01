"use client";

import { useEffect, useState } from "react";
import { Topbar } from "@/components/layout/topbar";
import { Card, StatCard } from "@/components/ui/card";
import { Route, Clock, Dumbbell, Target } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function ProgresoAtletaPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/progreso")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div>
        <Topbar titulo="Progreso" />
        <div className="p-8">
          <div className="glass-card h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  const est = data.estadisticas;

  return (
    <div>
      <Topbar titulo="Progreso" subtitulo="Tu evolución en las últimas 12 semanas" />
      <div className="space-y-6 p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Kilómetros totales" value={(est?.kilometrosAcumulados ?? 0).toFixed(1)} icon={Route} accent="red" />
          <StatCard label="Horas entrenadas" value={(est?.horasEntrenadas ?? 0).toFixed(1)} icon={Clock} accent="blue" />
          <StatCard label="Entrenamientos" value={est?.entrenamientosRealizados ?? 0} icon={Dumbbell} accent="neutral" />
          <StatCard label="Objetivo semanal" value={est?.objetivoSemanalKm ?? "—"} suffix="km" icon={Target} accent="red" />
        </div>

        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Kilómetros por semana</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.semanal}>
              <defs>
                <linearGradient id="kmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E53935" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#E53935" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
              <XAxis dataKey="semana" stroke="#6E6E76" fontSize={12} />
              <YAxis stroke="#6E6E76" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1B1B1E", border: "1px solid #2A2A2E", borderRadius: 12 }} />
              <Area type="monotone" dataKey="km" stroke="#E53935" fill="url(#kmGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h2 className="mb-4 font-display text-lg font-semibold text-white">Entrenamientos completados por semana</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.semanal}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2E" vertical={false} />
              <XAxis dataKey="semana" stroke="#6E6E76" fontSize={12} />
              <YAxis stroke="#6E6E76" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#1B1B1E", border: "1px solid #2A2A2E", borderRadius: 12 }} />
              <Bar dataKey="entrenamientos" fill="#2979FF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
