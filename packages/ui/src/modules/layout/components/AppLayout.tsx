import { AppLayoutPageSlot } from 'erxes-ui/modules/layout/components/AppLayoutPageSlot';
import {
  APP_LAYOUT_DEFAULT_WIDTH,
  AppLayoutResizeHandle,
  appLayoutOpenState,
  appLayoutWidthState,
} from 'erxes-ui/modules/layout/components/AppLayoutResizeHandle';
import { type ElementType, type ReactNode, useLayoutEffect, useRef, useState } from 'react';

import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMenu2,
} from '@tabler/icons-react';
import { useAtom } from 'jotai';

import { Button } from 'erxes-ui/components/button';
import { Separator } from 'erxes-ui/components/separator';
import { Sidebar } from 'erxes-ui/components/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { cn } from 'erxes-ui/lib/utils';

/** Keeps the sidebar toggle accessible when the navigation pane is hidden. */
const AppLayoutFloatingButton = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) => (
  <div className="absolute top-0 left-0 z-30 flex h-10 w-10 items-center justify-center bg-sidebar">
    <Button
      aria-expanded={false}
      aria-label={label}
      className="size-7 shrink-0"
      size="icon"
      title={label}
      type="button"
      variant="ghost"
      onClick={onClick}
    >
      {icon}
    </Button>
    <Separator.Inline className="absolute top-1/2 right-0 -translate-y-1/2" />
  </div>
);

// Fade only: moving a full-height pane reads as a jolt.
const AppLayoutFooter = ({ children }: { children?: ReactNode }) =>
  children ? (
    <div className="shrink-0 border-t px-2 py-1.5">
      <Sidebar.Menu>{children}</Sidebar.Menu>
    </div>
  ) : null;

/**
 * A link pinned to the bottom of an app sidebar (`AppLayout` `footer`), e.g.
 * the plugin's own settings or the way back from them.
 */
export const AppLayoutFooterLink = ({
  to,
  name,
  icon: Icon,
}: {
  to: string;
  name: string;
  icon?: ElementType;
}) => {
  const { pathname } = useLocation();
  const isActive = pathname === to || pathname.startsWith(`${to}/`);

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton isActive={isActive} render={<Link to={to} />}>
        {Icon && <Icon />}
        <span className="min-w-0 flex-1 truncate">{name}</span>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};

const APP_LAYOUT_PAGE_ENTER: Keyframe[] = [{ opacity: 0.4 }, { opacity: 1 }];

/** Groups nested routes by application and page for page-entry animations. */
const getPageKey = (pathname: string) => pathname.split('/').filter(Boolean).slice(0, 2).join('/');

/** The page pane: replays a short enter on route change, never the sidebar. */
const AppLayoutPage = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);
  const pageKey = getPageKey(pathname);
  const previousKey = useRef(pageKey);

  useLayoutEffect(() => {
    const page = pageRef.current;

    if (previousKey.current === pageKey) {
      return undefined;
    }

    previousKey.current = pageKey;

    if (!page?.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const animation = page.animate(APP_LAYOUT_PAGE_ENTER, {
      duration: 160,
      easing: 'ease-out',
    });

    return () => animation.cancel();
  }, [pageKey]);

  return (
    <div ref={pageRef} className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <AppLayoutPageSlot>{children}</AppLayoutPageSlot>
    </div>
  );
};

/** Keeps the desktop sidebar title and collapse action in a single header row. */
const AppLayoutSidebarHeader = ({
  title,
  onCollapse,
}: {
  title?: ReactNode;
  onCollapse: () => void;
}) => (
  <div className="flex h-10 shrink-0 items-center px-2">
    <div className="min-w-0 flex-1 truncate px-2 text-sm font-medium">{title}</div>
    <Button
      aria-expanded
      aria-label="Collapse sidebar"
      className="size-8 shrink-0"
      size="icon"
      title="Collapse sidebar"
      type="button"
      variant="ghost"
      onClick={onCollapse}
    >
      <IconLayoutSidebarLeftCollapse />
    </Button>
  </div>
);

/** Renders the persisted desktop sidebar beside the application page slot. */
const AppLayoutDesktop = ({
  id,
  children,
  footer,
  sidebar,
  title,
}: {
  id: string;
  children: ReactNode;
  sidebar: ReactNode;
  footer?: ReactNode;
  title?: ReactNode;
}) => {
  const [open, setOpen] = useAtom(appLayoutOpenState(id));
  const [width, setWidth] = useAtom(appLayoutWidthState(id));
  const [resizing, setResizing] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const currentWidth = width ?? APP_LAYOUT_DEFAULT_WIDTH;

  return (
    <div
      data-navigation-collapsed={!open || undefined}
      className={cn(
        'relative flex min-h-0 min-w-0 flex-1',
        resizing && 'cursor-col-resize select-none',
      )}
    >
      <aside
        ref={asideRef}
        aria-hidden={!open}
        className={cn(
          'relative flex w-(--app-layout-width) shrink-0 flex-col overflow-hidden border-r bg-sidebar',
          !resizing &&
            'transition-layout duration-300 ease-out-quint motion-reduce:transition-none',
          !open && 'w-0 border-r-0',
        )}
        style={{ '--app-layout-width': `${currentWidth}px` }}
      >
        <div className="flex h-full min-w-(--app-layout-width) flex-col">
          <AppLayoutSidebarHeader title={title} onCollapse={() => setOpen(false)} />
          <div
            data-navigation-context
            className="styled-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-1"
          >
            {sidebar}
          </div>
          <AppLayoutFooter>{footer}</AppLayoutFooter>
        </div>
        {open && (
          <AppLayoutResizeHandle
            panelRef={asideRef}
            onResize={setWidth}
            onReset={() => setWidth(null)}
            onResizingChange={setResizing}
          />
        )}
      </aside>
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {!open && (
          <AppLayoutFloatingButton
            label="Expand sidebar"
            icon={<IconLayoutSidebarLeftExpand />}
            onClick={() => setOpen(true)}
          />
        )}
        <AppLayoutPage>{children}</AppLayoutPage>
      </div>
    </div>
  );
};

/** Renders mobile navigation in the shared off-canvas sidebar. */
const AppLayoutMobile = ({
  children,
  footer,
  sidebar,
  title,
}: {
  children: ReactNode;
  sidebar: ReactNode;
  footer?: ReactNode;
  title?: ReactNode;
}) => {
  const { toggleSidebar } = Sidebar.useSidebar();

  return (
    <div
      data-navigation-collapsed
      className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <Sidebar collapsible="offcanvas">
        {title && (
          <Sidebar.Header>
            <span className="px-2 text-sm font-medium">{title}</span>
          </Sidebar.Header>
        )}
        <div data-navigation-context className="styled-scroll min-h-0 flex-1 overflow-y-auto pb-1">
          {sidebar}
        </div>
        <AppLayoutFooter>{footer}</AppLayoutFooter>
      </Sidebar>
      <AppLayoutFloatingButton
        label="Open sidebar"
        icon={<IconMenu2 className="size-4" />}
        onClick={toggleSidebar}
      />
      <AppLayoutPage>{children}</AppLayoutPage>
    </div>
  );
};

/** Selects the application layout for the current sidebar breakpoint. */
const AppLayoutBody = (props: {
  id: string;
  children: ReactNode;
  sidebar: ReactNode;
  footer?: ReactNode;
  title?: ReactNode;
}) => {
  const { isMobile } = Sidebar.useSidebar();

  return isMobile ? <AppLayoutMobile {...props} /> : <AppLayoutDesktop {...props} />;
};

/**
 * Full-height layout for an app (plugin or core module) below the core top
 * bar: the app owns its sidebar and pages. `id` keys the persisted
 * open/width state, so use the plugin or module name.
 */
export const AppLayout = ({
  id,
  sidebar,
  footer,
  title,
  children,
}: {
  id: string;
  sidebar: ReactNode;
  footer?: ReactNode;
  title?: ReactNode;
  children: ReactNode;
}) => (
  <Sidebar.Provider className="min-h-0 flex-1" sidebarKeyboardShortcut={false}>
    <AppLayoutBody id={id} sidebar={sidebar} footer={footer} title={title}>
      {children}
    </AppLayoutBody>
  </Sidebar.Provider>
);
