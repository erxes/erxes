import type { ReactNode } from 'react';

/** Amount comma-tai bolgono. */
export const formatAmount = (value?: number) => (value || 0).toLocaleString();

/** Empty value deer dash haruulna. */
const formatValue = (value?: ReactNode) => value || '-';

/** Neg label value row gargana. */
export const DetailRow = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: ReactNode;
  strong?: boolean;
}) => (
  <div className="grid grid-cols-[minmax(96px,160px)_1fr] items-center gap-4 border-b border-border/60 py-2.5 text-sm last:border-b-0">
    <span className="text-muted-foreground">{label}</span>
    <span
      className={`text-right ${
        strong ? 'font-semibold text-foreground' : 'text-foreground/90'
      }`}
    >
      {formatValue(value)}
    </span>
  </div>
);

/** Detail section title content-toi gargana. */
export const DetailSection = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={className || 'space-y-3'}>
    <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      {title}
    </h3>
    {children}
  </section>
);

/** Top summary deer neg tom utga gargana. */
export const SummaryMetric = ({
  label,
  value,
  align = 'left',
}: {
  label: string;
  value: ReactNode;
  align?: 'left' | 'right';
}) => (
  <div className={align === 'right' ? 'text-right' : ''}>
    <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
      {label}
    </div>
    <div className="mt-1 text-base font-semibold tabular-nums text-foreground">
      {formatValue(value)}
    </div>
  </div>
);
