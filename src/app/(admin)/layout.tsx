"use client";

import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { LayoutDashboard, Users, Dumbbell, CalendarDays, Trophy, MessageCircle } from "lucide-react";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Atletas", href: "/admin/atletas", icon: Users },
  { label: "Entrenamientos", href: "/admin/entrenamientos", icon: Dumbbell },
  { label: "Calendario", href: "/admin/calendario", icon: CalendarDays },
  { label: "Eventos", href: "/admin/eventos", icon: Trophy },
  { label: "Mensajes", href: "/admin/mensajes", icon: MessageCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar items={navItems} brandLabel="Panel del entrenador" />
      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
