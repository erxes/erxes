import { cn, Separator, Sidebar } from 'erxes-ui';
import React from 'react';
import { FavoriteToggleIconButton } from '../../favorites/components/FavoriteToggleIconButton';

export { FavoriteToggleIconButton };

export const PageHeaderRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
    className?: string;
    separatorClassName?: string;
  }
>(({ children, className, separatorClassName, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      <header
        className={cn(
          'flex items-center justify-between h-13 px-3 box-border shrink-0 bg-sidebar overflow-auto styled-scroll',
          className,
        )}
      >
        {children}
      </header>
      <Separator className={cn('w-auto flex-none', separatorClassName)} />
    </div>
  );
});

PageHeaderRoot.displayName = 'PageHeaderRoot';

export const PageHeaderStart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-2 flex-none pr-8', className)}
      {...props}
    >
      <Sidebar.Trigger />
      <Separator.Inline />
      {children}
    </div>
  );
});

PageHeaderStart.displayName = 'PageHeaderStart';

export const PageHeaderEnd = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode;
  }
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-3', className)}
      {...props}
    >
      {children}
    </div>
  );
});

PageHeaderEnd.displayName = 'PageHeaderEnd';

export const PageHeader = Object.assign(PageHeaderRoot, {
  Start: PageHeaderStart,
  End: PageHeaderEnd,
  FavoriteToggleButton: FavoriteToggleIconButton,
});
