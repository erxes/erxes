import type { ReactNode } from 'react';
import { cn } from 'erxes-ui';
/** Separates contact fields, tags, and linked records with plain headings. */
export const ContactDetailSection = ({
  title,
  children,
  nested = false,
}: {
  title: string;
  children: ReactNode;
  nested?: boolean;
}) => (
  <section className={cn('pt-1', !nested && 'border-b last:border-b-0')}>
    <h3
      className={cn(
        'flex items-center text-xs',
        nested ? 'h-7 px-1 font-normal text-muted-foreground' : 'h-10 px-3 font-medium',
      )}
    >
      {title}
    </h3>
    <div className={cn('min-w-0', nested ? 'pb-1' : 'px-3 pb-2')}>
      <div className="flex min-w-0 flex-col gap-1">{children}</div>
    </div>
  </section>
);
