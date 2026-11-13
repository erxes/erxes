import * as React from 'react';

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

export const SidebarHeader = ({ ref, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
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
