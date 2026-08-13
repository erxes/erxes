interface CallbackMiniKpiProps {
  label: string;
  value: string;

  accentVar?: string;
}

export function CallbackMiniKpi({
  label,
  value,
  accentVar,
}: CallbackMiniKpiProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border bg-muted/30 px-4 py-3">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span
        className="text-lg font-bold tabular-nums"
        style={accentVar ? { color: accentVar } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
