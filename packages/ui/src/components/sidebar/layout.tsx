import * as React from 'react';

import { Input } from 'erxes-ui/components/input';
import { ScrollArea } from 'erxes-ui/components/scroll-area';
import { Separator } from 'erxes-ui/components/separator';
import { cn } from 'erxes-ui/lib/utils';

export const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        'w-full bg-background shadow-none focus-visible:ring-2',
        className,
      )}
      {...props}
    />
  );
});
SidebarInput.displayName = 'SidebarInput';

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
});
SidebarHeader.displayName = 'SidebarHeader';

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn('flex flex-col gap-2 p-2', className)}
      {...props}
    />
  );
});
SidebarFooter.displayName = 'SidebarFooter';

export const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn('w-auto bg-border', className)}
      {...props}
    />
  );
});
SidebarSeparator.displayName = 'SidebarSeparator';

export const SidebarContent = React.forwardRef<
  React.ElementRef<typeof ScrollArea>,
  React.ComponentProps<typeof ScrollArea>
>(({ className, viewportClassName, ...props }, ref) => {
  return (
    <ScrollArea
      ref={ref}
      data-sidebar="content"
      className={cn(
        'flex min-h-0 flex-1 flex-col gap-2 group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      viewportClassName={cn(
        'min-w-0 [&>div]:block! [&>div]:min-w-0',
        viewportClassName,
      )}
      {...props}
    />
  );
});
SidebarContent.displayName = 'SidebarContent';
