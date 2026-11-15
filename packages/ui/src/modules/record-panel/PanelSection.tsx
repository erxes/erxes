import type { ElementType, ReactNode } from 'react';
import { cn } from '../../lib/utils';

/** Separates a record's fields, tags and linked records with plain headings. */
export const PanelSection = ({
  title,
  icon: Icon,
  children,
  nested = false,
}: {
  title: string;
  /** Beside the title, as a plugin's section has it. */
  icon?: ElementType;
  children: ReactNode;
  nested?: boolean;
}) => (
  <section className={cn('pt-1', !nested && 'border-b last:border-b-0')}>
    <h3
      className={cn(
        'flex items-center gap-1.5 text-xs',
        nested ? 'h-7 px-1 font-normal text-muted-foreground' : 'h-10 px-3 font-medium',
      )}
    >
      {Icon && <Icon className="size-3.5 flex-none text-muted-foreground" aria-hidden="true" />}
      {title}
    </h3>
    <div className={cn('min-w-0', nested ? 'pb-1' : 'px-3 pb-2')}>
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
    </div>
  </section>
);
