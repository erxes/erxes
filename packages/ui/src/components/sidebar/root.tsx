import React from 'react';

import { SIDEBAR_WIDTH_MOBILE } from './constants';
import { Sheet } from 'erxes-ui/components/sheet';
import { cn } from 'erxes-ui/lib/utils';
import { useSidebar } from './context';

const MOBILE_WIDTH: Record<`--${string}`, string> = { '--sidebar-width': SIDEBAR_WIDTH_MOBILE };

/** On small screens the sidebar opens as a sheet. */
const SidebarMobile = ({
  side,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { side: 'left' | 'right' }) => {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
      <Sheet.View
        data-sidebar="sidebar"
        data-mobile="true"
        className={cn(
          'w-(--sidebar-width) border-r-0 bg-sidebar p-0 text-foreground [&>button]:hidden',
          className,
        )}
        style={{ ...MOBILE_WIDTH }}
        side={side}
      >
        <div className="flex h-full w-full flex-col">{children}</div>
      </Sheet.View>
    </Sheet>
  );
};

type SidebarRootProps = React.ComponentProps<'div'> & {
  side?: 'left' | 'right';
  collapsible?: 'offcanvas' | 'icon' | 'none';
  mobileClassName?: string;
};

export const SidebarRoot = ({
  ref,
  side = 'left',
  collapsible = 'offcanvas',
  className,
  mobileClassName,
  children,
  ...props
}: SidebarRootProps) => {
  const { isMobile, state, collapseState } = useSidebar();

  const dataCollapsible =
    collapseState === 'compact' ? 'compact' : state === 'collapsed' ? collapsible : '';

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
      <SidebarMobile side={side} className={mobileClassName} {...props}>
        {children}
      </SidebarMobile>
    );
  }

  return (
    <div
      ref={ref}
      className="group peer hidden text-foreground md:block"
      data-state={state}
      data-collapsible={dataCollapsible}
      data-side={side}
    >
      <div
        className={cn(
          'relative h-svh w-(--sidebar-width) bg-transparent transition-layout duration-300 ease-out-quint',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[collapsible=compact]:w-(--sidebar-width-compact)',
          'group-data-[side=right]:rotate-180',
          'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
        )}
      />
      <div
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-layout duration-300 ease-out-quint md:flex',
          'group-data-[collapsible=compact]:w-(--sidebar-width-compact)',
          side === 'left'
            ? 'left-0 group-data-[collapsible=offcanvas]:-left-(--sidebar-width)'
            : 'right-0 group-data-[collapsible=offcanvas]:-right-(--sidebar-width)',
          'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
          className,
        )}
        {...props}
      >
        <div data-sidebar="sidebar" className="flex h-full w-full flex-col bg-sidebar">
          {children}
        </div>
      </div>
    </div>
  );
};

export const SidebarRail = ({ ref, className, ...props }: React.ComponentProps<'button'>) => {
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
        'absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 hover:after:bg-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex',
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
};

export const SidebarInset = ({ ref, className, ...props }: React.ComponentProps<'main'>) => {
  return (
    <main
      ref={ref}
      className={cn('relative flex min-h-svh flex-1 flex-col bg-background', className)}
      {...props}
    />
  );
};
