import React from "react";
import { cn } from "@/lib/utils";

type AccentBorderProps = {
  children: React.ReactNode;
  className?: string;
};

function CornerCross({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute block h-3 w-3 text-zinc-300 dark:text-zinc-600",
        className,
      )}
      aria-hidden
    >
      <span className="absolute inset-0 m-auto h-full w-px bg-current" />
      <span className="absolute inset-0 m-auto h-px w-full bg-current" />
    </span>
  );
}

export function AccentBorder({ children, className }: AccentBorderProps) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-zinc-200/80 bg-white/40 p-4 transition-shadow hover:shadow-[0_0_0_1px_rgba(24,24,27,0.12),_0_6px_24px_rgba(0,0,0,0.06)] dark:border-zinc-800/80 dark:bg-black/40",
        className,
      )}
    >
      {/* corner crosses */}
      <CornerCross className="-top-1 -left-1" />
      <CornerCross className="-top-1 -right-1" />
      <CornerCross className="-bottom-1 -left-1" />
      <CornerCross className="-bottom-1 -right-1" />

      {children}
    </div>
  );
}

export default AccentBorder;
