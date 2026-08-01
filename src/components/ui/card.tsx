import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass-card p-6", className)} {...props} />;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accent = "red",
  suffix,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "red" | "blue" | "neutral";
  suffix?: string;
}) {
  const accentClasses = {
    red: "text-brand-red bg-brand-red/10",
    blue: "text-brand-blue bg-brand-blue/10",
    neutral: "text-gray-300 bg-white/5",
  }[accent];

  return (
    <Card className="animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
          <p className="stat-number mt-2">
            {value}
            {suffix && <span className="ml-1 text-lg font-medium text-gray-400">{suffix}</span>}
          </p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", accentClasses)}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </Card>
  );
}

export function EstadoBadge({ estado }: { estado: "PENDIENTE" | "EN_PROCESO" | "COMPLETADO" }) {
  const map = {
    PENDIENTE: { cls: "badge-pendiente", label: "Pendiente" },
    EN_PROCESO: { cls: "badge-proceso", label: "En proceso" },
    COMPLETADO: { cls: "badge-completado", label: "Completado" },
  }[estado];
  return <span className={map.cls}>{map.label}</span>;
}
