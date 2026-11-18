import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'erxes-ui/lib/utils';

/** A page's outer box, full height, with `PageHeader` first inside it. */
export const PageContainer = ({
  ref,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
} & React.RefAttributes<HTMLDivElement>) => {
  return (
    <div ref={ref} className={cn('flex flex-col h-full overflow-hidden', className)} {...props}>
      {children}
    </div>
  );
};

const pageSubHeaderVariants = cva('flex h-auto flex-none gap-3 border-b bg-background px-3', {
  variants: {
    variant: {
      default: 'py-1',
      // Its content reaches the rule under it, as flush tabs do.
      flush: 'py-0',
    },
  },
  defaultVariants: { variant: 'default' },
});

/**
 * A bar under the page header with a rule below it, for tabs or controls.
 * `variant="flush"` drops its padding so tabs reach the rule. A list's bar is `ViewBar`.
 */
export const PageSubHeader = ({
  ref,
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof pageSubHeaderVariants>) => {
  return <div ref={ref} className={cn(pageSubHeaderVariants({ variant }), className)} {...props} />;
};
