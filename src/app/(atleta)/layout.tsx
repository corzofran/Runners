"use client";

import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { MobileBrandBar } from "@/components/layout/mobile-brand-bar";
import { LayoutDashboard, Dumbbell, CalendarDays, TrendingUp, MessageCircle, User, Flame } from "lucide-react";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/atleta/dashboard", icon: LayoutDashboard },
  { label: "Entrenamientos", href: "/atleta/entrenamientos", icon: Dumbbell },
  { label: "Calendario", href: "/atleta/calendario", icon: CalendarDays },
  { label: "Progreso", href: "/atleta/progreso", icon: TrendingUp },
  { label: "Ranking", href: "/atleta/ranking", icon: Flame },
  { label: "Mensajes", href: "/atleta/mensajes", icon: MessageCircle },
  { label: "Perfil", href: "/atleta/perfil", icon: User },
];

// En celular solo mostramos los 5 más usados para que quepan cómodo en la barra inferior.
const mobileItems: NavItem[] = [
  { label: "Inicio", href: "/atleta/dashboard", icon: LayoutDashboard },
  { label: "Entrenos", href: "/atleta/entrenamientos", icon: Dumbbell },
  { label: "Ranking", href: "/atleta/ranking", icon: Flame },
  { label: "Chat", href: "/atleta/mensajes", icon: MessageCircle },
  { label: "Perfil", href: "/atleta/perfil", icon: User },
];

export default function AtletaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar items={navItems} brandLabel="Mi cuenta" />
      <MobileBrandBar />
      <main className="pb-20 lg:pb-0 lg:pl-64">{children}</main>
      <MobileTabBar items={mobileItems} />
    </div>
  );
}
