"use client";

import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { LayoutDashboard, Dumbbell, CalendarDays, TrendingUp, MessageCircle, User } from "lucide-react";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/atleta/dashboard", icon: LayoutDashboard },
  { label: "Entrenamientos", href: "/atleta/entrenamientos", icon: Dumbbell },
  { label: "Calendario", href: "/atleta/calendario", icon: CalendarDays },
  { label: "Progreso", href: "/atleta/progreso", icon: TrendingUp },
  { label: "Mensajes", href: "/atleta/mensajes", icon: MessageCircle },
  { label: "Perfil", href: "/atleta/perfil", icon: User },
];

export default function AtletaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar items={navItems} brandLabel="Mi cuenta" />
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}