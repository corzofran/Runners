import { Zap } from "lucide-react";

export function MobileBrandBar() {
  return (
    <div className="flex items-center gap-2 border-b border-white/[0.06] bg-base-dark/80 px-4 py-3 backdrop-blur-xl lg:hidden">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-red">
        <Zap className="h-4 w-4 text-white" fill="white" />
      </div>
      <span className="font-display text-sm font-bold text-white">Runners en Proceso</span>
    </div>
  );
}
