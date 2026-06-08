import type { CSSProperties, ReactNode } from 'react';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  /** Colour class for the value text, e.g. 'text-[var(--chart-1)]'. */
  valueClass?: string;
  /** Inline style override for the value — use when colour comes from dynamic data. */
  valueStyle?: CSSProperties;
  /** Background + text class for the icon badge. */
  iconClass?: string;
  /** Inline style override for the icon badge — use when colour comes from dynamic data. */
  iconStyle?: CSSProperties;
  trend?: 'up' | 'down' | null;
}

/**
 * Single KPI metric card.
 * Uses CSS custom properties for shadows so it adapts to light/dark mode.
 * `valueStyle` / `iconStyle` accept inline overrides for dynamic backend colours.
 */
export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  valueClass = 'text-foreground',
  valueStyle,
  iconClass = 'bg-muted text-muted-foreground',
  iconStyle,
  trend,
}: KpiCardProps) {
  return (
    <div
      className="relative rounded-xl border bg-card p-5 transition-shadow hover:opacity-90"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
            {title}
          </p>
          <p
            className={`text-3xl font-bold tracking-tight ${valueClass}`}
            style={valueStyle}
          >
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
          style={iconStyle}
        >
          {icon}
        </div>
      </div>

      {trend && (
        <div
          className={`mt-2 flex items-center gap-1 text-xs font-medium ${
            trend === 'up' ? 'text-[var(--pos)]' : 'text-[var(--neg)]'
          }`}
        >
          {trend === 'up' ? (
            <IconTrendingUp className="h-3.5 w-3.5" />
          ) : (
            <IconTrendingDown className="h-3.5 w-3.5" />
          )}
        </div>
      )}
    </div>
  );
}
