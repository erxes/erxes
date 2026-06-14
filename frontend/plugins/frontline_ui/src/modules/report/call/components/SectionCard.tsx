import type { ReactNode } from 'react';
import { cn } from 'erxes-ui';

interface SectionCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  skeletonHeight?: string;
  /** Accent bar colour class, e.g. 'bg-[var(--chart-2)]'. Defaults to primary. */
  accentClass?: string;
}

/**
 * Lightweight container card shared by every report section.
 * Uses CSS custom properties for shadow so it adapts to light/dark mode.
 */
export function SectionCard({
  title,
  description,
  children,
  className,
  loading,
  skeletonHeight = 'h-40',
  accentClass = 'bg-[var(--primary)]',
}: SectionCardProps) {
  return (
    <div
      className={cn('rounded-xl border bg-card p-5', className)}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className={cn('h-4 w-1 rounded-full', accentClass)} />
          <h3 className="text-sm font-semibold leading-tight">{title}</h3>
        </div>
        {description && (
          <p className="mt-0.5 ml-3 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {loading ? (
        <div
          className={cn(
            'rounded-lg bg-muted/30 animate-pulse w-full',
            skeletonHeight,
          )}
        />
      ) : (
        children
      )}
    </div>
  );
}
