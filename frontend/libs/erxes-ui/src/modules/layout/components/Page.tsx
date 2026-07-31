import React from 'react';
import { cn } from 'erxes-ui/lib';

export const PageContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children?: React.ReactNode;
  }
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col h-full overflow-hidden', className)}
      {...props}
    >
      {children || 'Page'}
    </div>
  );
});

export const PageSubHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex-none bg-sidebar px-3 py-2 border-b flex gap-3 h-auto',
        className,
      )}
      {...props}
    />
  );
});

PageContainer.displayName = 'PageContainer';
