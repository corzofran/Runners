import Link from "next/link";
import { ArrowRight, Zap, Activity, CalendarDays, MessageCircle, TrendingUp, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Activity,
    title: "Planes a la medida",
    desc: "Diseña cada sesión con ritmo, series, frecuencia cardíaca y archivos adjuntos — sin PDFs sueltos ni mensajes perdidos en WhatsApp.",
  },
  {
    icon: CalendarDays,
    title: "Calendario del equipo",
    desc: "Programa, arrastra y reprograma entrenamientos y eventos en una sola vista, filtrable por atleta.",
  },
  {
    icon: TrendingUp,
    title: "Progreso real",
    desc: "Kilómetros, horas, asistencia y ritmo promedio, visualizados en gráficas que motivan a seguir.",
  },
  {
    icon: MessageCircle,
    title: "Un solo canal",
    desc: "Chat directo entrenador–atleta y notificaciones automáticas cuando algo cambia.",
  },
  {
    icon: ShieldCheck,
    title: "Control total",
    desc: "Solo tú creas cuentas. Sin registro público, con contraseñas cifradas y sesiones seguras.",
  },
  {
    icon: Zap,
    title: "Hecho para correr",
    desc: "Interfaz rápida y clara, pensada para revisarse antes de salir a entrenar — en el celular o la compu.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red shadow-glow">
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <span className="font-display text-lg font-bold text-white">Runners en Proceso</span>
        </div>
        <Link href="/login" className="btn-secondary text-sm">
          Iniciar sesión
        </Link>
      </header>

      {/* Hero */}
      <section className="relative px-6 pb-24 pt-16 lg:px-12 lg:pt-24">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-gray-300 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-red animate-pulse" />
            Plataforma para entrenadores de atletismo
          </div>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl animate-fade-up">
            Deja de enviar planes
            <br />
            por <span className="text-brand-red">WhatsApp</span>.
          </h1>
          <p
            className="mx-auto mt-6 max-w-xl text-lg text-gray-400 animate-fade-up"
            style={{ animationDelay: "0.1s", opacity: 0 }}
          >
            Un solo lugar para asignar entrenamientos, dar seguimiento al progreso de tus atletas
            y mantener a todo el equipo alineado — con el control siempre en tus manos.
          </p>
          <div
            className="mt-10 flex items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.2s", opacity: 0 }}
          >
            <Link href="/login" className="btn-primary px-7 py-3 text-base">
              Entrar a la plataforma
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative px-6 pb-28 lg:px-12">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass-card animate-fade-up p-6"
              style={{ animationDelay: `${0.05 * i}s`, opacity: 0 }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-6 py-8 text-center text-xs text-gray-600 lg:px-12">
        © {new Date().getFullYear()} Runners en Proceso. Acceso exclusivo para entrenadores y atletas registrados.
      </footer>
    </div>
  );
}
