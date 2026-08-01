"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon, LogOut, Zap } from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon };

export function Sidebar({
  items,
  brandLabel,
}: {
  items: NavItem[];
  brandLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-base-dark/80 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-red shadow-glow">
          <Zap className="h-5 w-5 text-white" fill="white" />
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-none text-white">Runners</p>
          <p className="text-[11px] font-medium leading-none text-gray-500 mt-1">en Proceso</p>
        </div>
      </div>

      <p className="px-6 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wider text-gray-600">
        {brandLabel}
      </p>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-brand-red/10 text-white shadow-[inset_2px_0_0_0_#E53935]"
                  : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", active && "text-brand-red")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <button
          onClick={cerrarSesion}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.05] hover:text-brand-red-light"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
