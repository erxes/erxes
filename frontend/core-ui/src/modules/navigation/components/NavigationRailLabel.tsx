import { cn } from 'erxes-ui';
import type { ReactNode } from 'react';

export const NavigationRailLabel = ({
  children,
  className,
  expanded,
}: {
  children: ReactNode;
  className?: string;
  expanded: boolean;
}) => {
  return (
    <span
      className={cn(
        'min-w-0 overflow-hidden opacity-0 transition-opacity duration-150 ease-out motion-reduce:transition-none',
        expanded
          ? 'delay-75 opacity-100 motion-reduce:delay-0'
          : 'pointer-events-none delay-0 opacity-0',
        className,
      )}
    >
      {children}
    </span>
  );
};
