import { cn } from 'erxes-ui';
import type { ReactNode } from 'react';

export const DealDetailSection = ({
  title,
  action,
  children,
  nested = false,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  nested?: boolean;
}) => (
  <section className={cn('min-w-0', nested ? 'pt-1' : 'border-t pt-1')}>
    <h3
      className={cn(
        'flex items-center justify-between gap-2 px-1 text-xs',
        nested ? 'h-7 font-normal text-muted-foreground' : 'h-10 font-medium',
      )}
    >
      <span className="min-w-0 truncate">{title}</span>
      {action}
    </h3>
    <div className="flex min-w-0 flex-col gap-1 pb-1">{children}</div>
  </section>
);
