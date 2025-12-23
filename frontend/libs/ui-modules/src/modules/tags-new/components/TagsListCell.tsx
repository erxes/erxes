import { ReactNode } from 'react';
import { cn } from 'erxes-ui';
export const TagsListCell = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('h-full w-40 flex items-center', className)}>
      {children}
    </div>
  );
};

export const TagsListHead = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'h-full w-40 flex items-center uppercase font-mono text-accent-foreground font-semibold text-xs',
        className,
      )}
    >
      {children}
    </div>
  );
};
