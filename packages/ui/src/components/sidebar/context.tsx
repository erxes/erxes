import React from 'react';

import { Tooltip } from 'erxes-ui/components/tooltip';
import { useIsMobile } from 'erxes-ui/hooks/use-mobile';
import { cn } from 'erxes-ui/lib/utils';
import { useScopedHotkeys } from 'erxes-ui/modules/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from 'erxes-ui/modules/hotkey/types/AppHotkeyScope';

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

type SidebarStateOptions = {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  collapseState?: CollapseState;
  defaultCollapseState?: CollapseState;
  onCollapseStateChange?: (state: CollapseState) => void;
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

const rememberInCookie = (name: string, value: string) => {
  document.cookie = `${name}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
};

/**
 * Open and collapse state, controlled from outside through the props or kept here.
 * Passing `collapseState` or `defaultCollapseState` turns on the three steps
 * (expanded, compact, collapsed); otherwise the sidebar is only open or closed.
 */
function useSidebarState({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  collapseState: collapseStateProp,
  defaultCollapseState,
  onCollapseStateChange,
}: SidebarStateOptions) {
  const threeStep = collapseStateProp !== undefined || defaultCollapseState !== undefined;
  const [openState, setOpenState] = React.useState(defaultOpen);

  const [collapseStateState, setCollapseStateState] = React.useState<CollapseState>(
    defaultCollapseState ?? (defaultOpen ? 'expanded' : 'collapsed'),
  );

  const openControlled = openProp ?? openState;
  const threeStepState = collapseStateProp ?? collapseStateState;
  const collapseState = threeStep ? threeStepState : openControlled ? 'expanded' : 'collapsed';
  const open = threeStep ? collapseState === 'expanded' : openControlled;

  const setCollapseState = React.useCallback(
    (next: CollapseState) => {
      if (onCollapseStateChange) {
        onCollapseStateChange(next);
      } else {
        setCollapseStateState(next);
      }

      rememberInCookie(SIDEBAR_COLLAPSE_COOKIE_NAME, next);
    },
    [onCollapseStateChange],
  );

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (threeStep) {
        setCollapseState(next ? 'expanded' : 'collapsed');

        return;
      }

      if (onOpenChange) {
        onOpenChange(next);
      } else {
        setOpenState(next);
      }

      rememberInCookie(SIDEBAR_COOKIE_NAME, String(next));
    },
    [onOpenChange, threeStep, setCollapseState],
  );

  const toggleOpen = React.useCallback(() => {
    if (threeStep) {
      setCollapseState(nextCollapseState(collapseState));
    } else {
      setOpen(!open);
    }
  }, [threeStep, collapseState, open, setCollapseState, setOpen]);

  return { collapseState, open, setOpen, toggleOpen };
}

type SidebarProviderProps = React.ComponentProps<'div'> &
  SidebarStateOptions & {
    sidebarKeyboardShortcut?: string | false;
    sidebarWidth?: string;
    sidebarWidthIcon?: string;
  };

export const SidebarProvider = ({
  ref,
  defaultOpen,
  open: openProp,
  onOpenChange,
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
}: SidebarProviderProps & React.RefAttributes<HTMLDivElement>) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  const { collapseState, open, setOpen, toggleOpen } = useSidebarState({
    defaultOpen,
    open: openProp,
    onOpenChange,
    collapseState: collapseStateProp,
    defaultCollapseState,
    onCollapseStateChange,
  });

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((wasOpen) => !wasOpen);
    } else {
      toggleOpen();
    }
  }, [isMobile, toggleOpen]);

  useScopedHotkeys(
    `Meta+${sidebarKeyboardShortcut}`,
    toggleSidebar,
    AppHotkeyScope.Sidebar,
    undefined,
    { enabled: Boolean(sidebarKeyboardShortcut) },
  );

  const contextValue = React.useMemo<ISidebarContext>(
    () => ({
      state: collapseState === 'collapsed' ? 'collapsed' : 'expanded',
      collapseState,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [collapseState, open, setOpen, isMobile, openMobile, toggleSidebar],
  );

  const cssVariables: Record<`--${string}`, string> = {
    '--sidebar-width': sidebarWidth,
    '--sidebar-width-compact': SIDEBAR_WIDTH_COMPACT,
    '--sidebar-width-icon': sidebarWidthIcon,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      <Tooltip.Provider delay={0}>
        <div
          style={{ ...cssVariables, ...style }}
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
};
