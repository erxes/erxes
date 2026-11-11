import { cn } from 'erxes-ui/lib';
import React from 'react';

export const EllipsisDisplay = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap',
      className,
    )}
    {...props}
  />
));

EllipsisDisplay.displayName = 'EllipsisDisplay';
