import { Separator } from 'erxes-ui/components/separator';
import { cn } from 'erxes-ui/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

const PageHeaderRoot = ({
  ref,
  children,
  className,
  separatorClassName,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  separatorClassName?: string;
} & React.RefAttributes<HTMLDivElement>) => (
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
);

const PageHeaderStart = ({ ref, children, className, ...props }: React.ComponentProps<'div'>) => (
  <div ref={ref} className={cn('flex flex-none items-center gap-2 pr-8', className)} {...props}>
    {children}
  </div>
);

const PageHeaderEnd = ({ ref, children, className, ...props }: React.ComponentProps<'div'>) => (
  <div ref={ref} className={cn('flex items-center gap-3', className)} {...props}>
    {children}
  </div>
);

/** A page's title bar: `PageHeader.Start` holds the title, `PageHeader.End` the actions. */
export const PageHeader = Object.assign(PageHeaderRoot, {
  Start: PageHeaderStart,
  End: PageHeaderEnd,
});
