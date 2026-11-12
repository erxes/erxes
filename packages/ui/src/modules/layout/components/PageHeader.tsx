import { Separator } from 'erxes-ui/components/separator';
import { cn } from 'erxes-ui/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

const PageHeaderRoot = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { children: ReactNode; separatorClassName?: string }
>(({ children, className, separatorClassName, ...props }, ref) => (
  <div ref={ref} {...props}>
    <header
      className={cn(
        'box-border flex h-10 shrink-0 items-center justify-between overflow-auto bg-background px-3 styled-scroll',
        className,
      )}
    >
      {children}
    </header>
    <Separator className={cn('w-auto flex-none', separatorClassName)} />
  </div>
));

PageHeaderRoot.displayName = 'PageHeaderRoot';

const PageHeaderStart = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-none items-center gap-2 pr-8', className)} {...props}>
      {children}
    </div>
  ),
);

PageHeaderStart.displayName = 'PageHeaderStart';

const PageHeaderEnd = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-3', className)} {...props}>
      {children}
    </div>
  ),
);

PageHeaderEnd.displayName = 'PageHeaderEnd';

/** A page's title bar: `PageHeader.Start` holds the title, `PageHeader.End` the actions. */
export const PageHeader = Object.assign(PageHeaderRoot, {
  Start: PageHeaderStart,
  End: PageHeaderEnd,
});
