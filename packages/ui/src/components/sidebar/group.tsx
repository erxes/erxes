import React from 'react';

import { cn } from 'erxes-ui/lib/utils';

export const SidebarGroup = ({ ref, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn(
        'relative flex w-full min-w-0 flex-col px-4 py-3 group-data-[collapsible=icon]:px-2',
        className,
      )}
      {...props}
    />
  );
};

export const SidebarGroupLabel = ({ className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      data-sidebar="group-label"
      className={cn(
        'flex h-6 shrink-0 items-center rounded-lg px-2 font-sans text-3xs font-semibold uppercase tracking-wider text-muted-foreground outline-hidden transition-layout duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className,
      )}
      {...props}
    />
  );
};

export const SidebarGroupAction = ({ className, ...props }: React.ComponentProps<'button'>) => {
  return (
    <button
      type="button"
      data-sidebar="group-action"
      className={cn(
        'absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-foreground outline-hidden transition-transform hover:bg-accent focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
        // Increases the hit area of the button on mobile.
        'after:absolute after:-inset-2 md:after:hidden',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
};

export const SidebarGroupContent = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn('w-full text-sm', className)}
    {...props}
  />
);
