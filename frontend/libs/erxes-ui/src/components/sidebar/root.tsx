import * as React from 'react';

import { SIDEBAR_WIDTH_MOBILE } from './constants';
import { Sheet } from 'erxes-ui/components/sheet';
import { cn } from 'erxes-ui/lib/utils';
import { useSidebar } from './context';

export const SidebarRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    side?: 'left' | 'right';
    variant?: 'sidebar' | 'floating' | 'inset';
    collapsible?: 'offcanvas' | 'icon' | 'none';
    mobileClassName?: string;
  }
>(
  (
    {
      side = 'left',
      variant = 'sidebar',
      collapsible = 'offcanvas',
      className,
      mobileClassName,
      children,
      ...props
    },
    ref,
  ) => {
    const { isMobile, state, collapseState, openMobile, setOpenMobile } =
      useSidebar();

    let dataCollapsible = '';
    if (collapseState === 'compact') {
      dataCollapsible = 'compact';
    } else if (state === 'collapsed') {
      dataCollapsible = collapsible;
    }

    if (collapsible === 'none') {
      return (
        <div
          className={cn(
            'flex h-full w-(--sidebar-width) flex-col bg-sidebar text-foreground',
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      );
    }

    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <Sheet.View
            data-sidebar="sidebar"
            data-mobile="true"
            className={cn(
              'w-(--sidebar-width) border-r-0 bg-sidebar p-0 text-foreground [&>button]:hidden',
              mobileClassName,
            )}
            style={
              {
                '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </Sheet.View>
        </Sheet>
      );
    }

    return (
      <div
        ref={ref}
        className="group peer hidden text-foreground md:block"
        data-state={state}
        data-collapsible={dataCollapsible}
        data-variant={variant}
        data-side={side}
      >
        <div
          className={cn(
            'relative h-svh w-(--sidebar-width) bg-transparent transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            'group-data-[collapsible=offcanvas]:w-0',
            'group-data-[collapsible=compact]:w-(--sidebar-width-compact)',
            'group-data-[side=right]:rotate-180',
            variant === 'floating' || variant === 'inset'
              ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]'
              : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
          )}
        />
        <div
          className={cn(
            'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:flex',
            'group-data-[collapsible=compact]:w-(--sidebar-width-compact)',
            side === 'left'
              ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
              : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
            variant === 'floating' || variant === 'inset'
              ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]'
              : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
            className,
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar"
            className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
          >
            {children}
          </div>
        </div>
      </div>
    );
  },
);
SidebarRoot.displayName = 'SidebarRoot';

export const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'>
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      ref={ref}
      data-sidebar="rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex',
        'in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize',
        '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
        'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full hover:group-data-[collapsible=offcanvas]:bg-sidebar',
        '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
        '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
        className,
      )}
      {...props}
    />
  );
});
SidebarRail.displayName = 'SidebarRail';

export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'main'>
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        'relative flex min-h-svh flex-1 flex-col bg-background',
        'peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow',
        className,
      )}
      {...props}
    />
  );
});
SidebarInset.displayName = 'SidebarInset';
