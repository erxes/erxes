import { cva, type VariantProps } from 'class-variance-authority';
import { Separator } from 'erxes-ui/components/separator';
import { cn } from 'erxes-ui/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

// The left padding leaves room for the app sidebar's expand button while the sidebar is collapsed.
const pageHeaderVariants = cva(
  'box-border flex shrink-0 items-center justify-between bg-background px-3 navigation-collapsed:pl-13 styled-scroll',
  {
    variants: {
      variant: {
        default: 'h-10 gap-8 overflow-auto',
        // Grows to a second line when the title and actions don't fit on one.
        wrap: 'h-auto min-h-10 flex-wrap gap-x-3 gap-y-1 overflow-visible py-1',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const PageHeaderRoot = ({
  ref,
  children,
  className,
  separatorClassName,
  variant,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  separatorClassName?: string;
} & VariantProps<typeof pageHeaderVariants> &
  React.RefAttributes<HTMLDivElement>) => (
  <div ref={ref} {...props}>
    <header className={cn(pageHeaderVariants({ variant }), className)}>{children}</header>
    <Separator className={cn('w-auto flex-none', separatorClassName)} />
  </div>
);

const pageHeaderStartVariants = cva('flex flex-none items-center gap-2', {
  variants: {
    variant: {
      default: '',
      // The first crumb moves into the header's padding, so its icon lines up with the page content.
      flush:
        '[&>nav:first-of-type>ol>li:first-child_a]:-ml-2 [&>nav:first-of-type>ol>li:first-child_a]:pl-2 [&>nav:first-of-type>ol>li:first-child_button]:-ml-2 [&>nav:first-of-type>ol>li:first-child_button]:pl-2',
    },
  },
  defaultVariants: { variant: 'default' },
});

const PageHeaderStart = ({
  ref,
  children,
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof pageHeaderStartVariants>) => (
  <div ref={ref} className={cn(pageHeaderStartVariants({ variant }), className)} {...props}>
    {/* A collapsed Sidebar.Panel on the page puts its expand button here. */}
    <span data-sidebar-panel-slot="" className="contents" />
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
