import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'erxes-ui/lib/utils';

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
      {children || 'Page'}
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

export const PageSubHeader = ({
  ref,
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof pageSubHeaderVariants>) => {
  return <div ref={ref} className={cn(pageSubHeaderVariants({ variant }), className)} {...props} />;
};
