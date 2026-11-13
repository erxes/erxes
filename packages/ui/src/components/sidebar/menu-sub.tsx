import * as React from 'react';

import { SidebarTreeIndicator } from 'erxes-ui/components/sidebar-tree-indicator';
import { Slot } from 'radix-ui';
import { cn } from 'erxes-ui/lib/utils';
import { mergeRefs } from 'react-merge-refs';

export const SidebarMenuSub = ({
  ref,
  className,
  children,
  ...props
}: React.ComponentProps<'ul'>) => {
  const subRef = React.useRef<HTMLUListElement>(null);

  return (
    <ul
      ref={mergeRefs([subRef, ref])}
      data-sidebar="menu-sub"
      className={cn(
        'relative ml-3.5 flex min-w-0 translate-x-px flex-col gap-1 pl-2.5 py-0.5',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    >
      <SidebarTreeIndicator as="li" containerRef={subRef} />
      {children}
    </ul>
  );
};

export const SidebarMenuSubItem = ({ ref, ...props }: React.ComponentProps<'li'>) => (
  <li ref={ref} {...props} />
);

export const SidebarMenuSubButton = ({
  ref,
  asChild = false,
  size = 'md',
  isActive,
  className,
  ...props
}: React.ComponentProps<'a'> & {
  asChild?: boolean;
  size?: 'sm' | 'md';
  isActive?: boolean;
}) => {
  const Comp = asChild ? Slot.Root : 'a';

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded px-2 outline-hidden font-normal hover:bg-accent focus-visible:ring-2 active:bg-accent disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
        'data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-semibold data-[active=true]:[&>svg]:text-primary data-[active=true]:[&>svg]:animate-icon-pop motion-reduce:[&>svg]:animate-none [&>svg]:transition-transform active:[&>svg]:scale-90',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        'group-data-[collapsible=icon]:hidden',
        className,
      )}
      {...props}
    />
  );
};
