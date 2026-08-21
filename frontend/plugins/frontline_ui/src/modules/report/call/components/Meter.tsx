import { cn } from 'erxes-ui';

interface MeterProps {
  value: number;

  colorVar?: string;
  className?: string;
}

export function Meter({
  value,
  colorVar = 'var(--primary)',
  className,
}: MeterProps) {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));

  return (
    <div
      aria-hidden
      className={cn(
        'h-1 w-full overflow-hidden rounded-full bg-muted',
        className,
      )}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: colorVar }}
      />
    </div>
  );
}

export function rateColorVar(rate: number | null | undefined): string {
  if (rate == null) return 'var(--muted-foreground)';
  if (rate >= 80) return 'var(--success)';
  if (rate >= 50) return 'var(--warning)';
  return 'var(--destructive)';
}
