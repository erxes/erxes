import * as React from 'react';

import { Tooltip } from 'erxes-ui/components/tooltip';
import { useIsMobile } from 'erxes-ui/hooks/use-mobile';
import { cn } from 'erxes-ui/lib/utils';
import { useScopedHotkeys } from 'erxes-ui/modules/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from 'erxes-ui/modules/hotkey/types/AppHotkeyScope';
import { Key } from 'erxes-ui/types/Key';
import {
  nextCollapseState,
  SIDEBAR_COLLAPSE_COOKIE_NAME,
  SIDEBAR_COOKIE_MAX_AGE,
  SIDEBAR_COOKIE_NAME,
  SIDEBAR_KEYBOARD_SHORTCUT,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_COMPACT,
  SIDEBAR_WIDTH_ICON,
  type CollapseState,
} from './constants';

type ISidebarContext = {
  state: 'expanded' | 'collapsed';
  collapseState: CollapseState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<ISidebarContext | null>(null);

export function useOptionalSidebar() {
  return React.useContext(SidebarContext);
}

export function useSidebar() {
  const context = useOptionalSidebar();
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }

  return context;
}

export const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    collapseState?: CollapseState;
    defaultCollapseState?: CollapseState;
    onCollapseStateChange?: (state: CollapseState) => void;
    sidebarKeyboardShortcut?: string | false;
    sidebarWidth?: string;
    sidebarWidthIcon?: string;
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      collapseState: collapseStateProp,
      defaultCollapseState,
      onCollapseStateChange,
      sidebarKeyboardShortcut = SIDEBAR_KEYBOARD_SHORTCUT,
      sidebarWidth = SIDEBAR_WIDTH,
      sidebarWidthIcon = SIDEBAR_WIDTH_ICON,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    const threeStep =
      collapseStateProp !== undefined || defaultCollapseState !== undefined;

    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const openControlled = openProp ?? _open;

    const [_collapseState, _setCollapseState] = React.useState<CollapseState>(
      defaultCollapseState ?? (defaultOpen ? 'expanded' : 'collapsed'),
    );
    let collapseState: CollapseState;
    if (threeStep) {
      collapseState = collapseStateProp ?? _collapseState;
    } else {
      collapseState = openControlled ? 'expanded' : 'collapsed';
    }

    const open = threeStep ? collapseState === 'expanded' : openControlled;

    const setCollapseState = React.useCallback(
      (value: CollapseState | ((value: CollapseState) => CollapseState)) => {
        const next = typeof value === 'function' ? value(collapseState) : value;
        if (onCollapseStateChange) {
          onCollapseStateChange(next);
        } else {
          _setCollapseState(next);
        }
        document.cookie = `${SIDEBAR_COLLAPSE_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [onCollapseStateChange, collapseState],
    );

    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === 'function' ? value(open) : value;
        if (threeStep) {
          setCollapseState(openState ? 'expanded' : 'collapsed');
          return;
        }
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }

        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, open, threeStep, setCollapseState],
    );

    const toggleSidebar = React.useCallback(() => {
      if (isMobile) {
        setOpenMobile((open) => !open);
        return;
      }
      if (threeStep) {
        setCollapseState((prev) => nextCollapseState(prev));
        return;
      }
      setOpen((open) => !open);
    }, [isMobile, threeStep, setCollapseState, setOpen, setOpenMobile]);

    // Adds a keyboard shortcut to toggle the sidebar.

    useScopedHotkeys(
      sidebarKeyboardShortcut
        ? `${Key.Meta}+${sidebarKeyboardShortcut}`
        : '__sidebar-shortcut-disabled__',
      toggleSidebar,
      AppHotkeyScope.Sidebar,
    );

    const state = collapseState === 'collapsed' ? 'collapsed' : 'expanded';

    const contextValue = React.useMemo<ISidebarContext>(
      () => ({
        state,
        collapseState,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [
        state,
        collapseState,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      ],
    );

    return (
      <SidebarContext.Provider value={contextValue}>
        <Tooltip.Provider delayDuration={0}>
          <div
            style={
              {
                '--sidebar-width': sidebarWidth,
                '--sidebar-width-compact': SIDEBAR_WIDTH_COMPACT,
                '--sidebar-width-icon': sidebarWidthIcon,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              'group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
              className,
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </Tooltip.Provider>
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = 'SidebarProvider';
