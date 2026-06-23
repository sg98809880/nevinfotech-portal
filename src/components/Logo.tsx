export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-ink-900 dark:bg-gold-500 font-display text-sm font-bold text-gold-400 dark:text-ink-950">
        N
      </span>
      <span className="font-display text-[15px] font-semibold tracking-tight">
        NevInfotech <span className="text-gold-600 dark:text-gold-400">Portal</span>
      </span>
    </div>
  );
}
