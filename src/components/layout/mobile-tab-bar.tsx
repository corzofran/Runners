"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

export type MobileNavItem = { label: string; href: string; icon: LucideIcon };

export function MobileTabBar({ items }: { items: MobileNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-white/[0.08] bg-base-dark/95 backdrop-blur-xl lg:hidden [padding-bottom:env(safe-area-inset-bottom)]">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
              active ? "text-brand-red" : "text-gray-500"
            )}
          >
            <item.icon className={cn("h-5 w-5", active && "fill-brand-red/10")} strokeWidth={active ? 2.4 : 2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
