import { cn } from 'erxes-ui';

interface MeterProps {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  /** CSS colour for the filled portion, e.g. `var(--pos)`. */
  colorVar?: string;
  className?: string;
}

/**
 * Thin proportional bar shown under a number in a report table, so a column of
 * counts can be compared at a glance instead of read digit by digit.
 * Presentational only — the value it illustrates is always printed next to it.
 */
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

/**
 * Colour for a percentage: good above 80, acceptable above 50, poor below.
 *
 * Uses the theme's own semantic tokens. `--pos` / `--neg` / `--warn`, which
 * appear elsewhere in the call report, are not defined anywhere in the
 * stylesheet and resolve to nothing.
 */
export function rateColorVar(rate: number | null | undefined): string {
  if (rate == null) return 'var(--muted-foreground)';
  if (rate >= 80) return 'var(--success)';
  if (rate >= 50) return 'var(--warning)';
  return 'var(--destructive)';
}
