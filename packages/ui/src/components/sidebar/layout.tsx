import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { Input } from 'erxes-ui/components/input';
import { ScrollArea } from 'erxes-ui/components/scroll-area';
import { Separator } from 'erxes-ui/components/separator';
import { cn } from 'erxes-ui/lib/utils';

export const SidebarInput = ({ ref, className, ...props }: React.ComponentProps<typeof Input>) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn('w-full bg-background shadow-none focus-visible:ring-2', className)}
      {...props}
    />
  );
};

const sidebarHeaderVariants = cva('flex flex-col gap-2', {
  variants: {
    variant: {
      default: 'p-2',
      // Stays above the menu as it scrolls, and fades the items passing under it.
      sticky:
        'sticky top-0 z-10 bg-sidebar px-2 pt-0 pb-1 after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-4 after:bg-linear-to-b after:from-sidebar after:to-transparent',
    },
  },
  defaultVariants: { variant: 'default' },
});

export const SidebarHeader = ({
  ref,
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof sidebarHeaderVariants>) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn(sidebarHeaderVariants({ variant }), className)}
      {...props}
    />
  );
};

export const SidebarFooter = ({ ref, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
};

export const SidebarSeparator = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof Separator>) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn('w-auto bg-border', className)}
      {...props}
    />
  );
};

export const SidebarContent = ({
  ref,
  className,
  viewportClassName,
  ...props
}: React.ComponentProps<typeof ScrollArea>) => {
  return (
    <ScrollArea
      ref={ref}
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      viewportClassName={cn('min-w-0 [&>div]:block! [&>div]:min-w-0', viewportClassName)}
      {...props}
    />
  );
};
