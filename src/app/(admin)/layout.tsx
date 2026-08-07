"use client";

import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { MobileBrandBar } from "@/components/layout/mobile-brand-bar";
import { LayoutDashboard, Users, Dumbbell, CalendarDays, Trophy, MessageCircle } from "lucide-react";

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Atletas", href: "/admin/atletas", icon: Users },
  { label: "Entrenamientos", href: "/admin/entrenamientos", icon: Dumbbell },
  { label: "Calendario", href: "/admin/calendario", icon: CalendarDays },
  { label: "Eventos", href: "/admin/eventos", icon: Trophy },
  { label: "Mensajes", href: "/admin/mensajes", icon: MessageCircle },
];

const mobileItems: NavItem[] = [
  { label: "Inicio", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Atletas", href: "/admin/atletas", icon: Users },
  { label: "Entrenos", href: "/admin/entrenamientos", icon: Dumbbell },
  { label: "Calendario", href: "/admin/calendario", icon: CalendarDays },
  { label: "Chat", href: "/admin/mensajes", icon: MessageCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar items={navItems} brandLabel="Panel del entrenador" />
      <MobileBrandBar />
      <main className="pb-20 lg:pb-0 lg:pl-64">{children}</main>
      <MobileTabBar items={mobileItems} />
    </div>
  );
}
