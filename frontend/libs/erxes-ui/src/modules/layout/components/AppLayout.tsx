import * as React from 'react';

import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconMenu2,
} from '@tabler/icons-react';
import { useAtom } from 'jotai';

import { Button } from 'erxes-ui/components/button';
import { Separator } from 'erxes-ui/components/separator';
import { Sidebar } from 'erxes-ui/components/sidebar';
import { atomWithStorage } from 'jotai/utils';
import { Link, useLocation } from 'react-router-dom';
import { cn } from 'erxes-ui/lib/utils';

const APP_LAYOUT_DEFAULT_WIDTH = 240;
const APP_LAYOUT_MIN_WIDTH = 180;
const APP_LAYOUT_MAX_WIDTH = 480;
const APP_LAYOUT_KEYBOARD_STEP = 16;

const createOpenAtom = (id: string) =>
  atomWithStorage<boolean>(`app-layout:${id}:open`, true, undefined, {
    getOnInit: true,
  });

const createWidthAtom = (id: string) =>
  atomWithStorage<number | null>(`app-layout:${id}:width`, null, undefined, {
    getOnInit: true,
  });

// Derived from the factories so the type matches under every tsconfig
// (the declaration build is non-strict, which widens atomWithStorage).
type TAppLayoutAtoms = {
  open: ReturnType<typeof createOpenAtom>;
  width: ReturnType<typeof createWidthAtom>;
};

const appLayoutAtoms = new Map<string, TAppLayoutAtoms>();

const getAppLayoutAtoms = (id: string) => {
  const existing = appLayoutAtoms.get(id);

  if (existing) {
    return existing;
  }

  const atoms: TAppLayoutAtoms = {
    open: createOpenAtom(id),
    width: createWidthAtom(id),
  };

  appLayoutAtoms.set(id, atoms);

  return atoms;
};

const clampWidth = (value: number) =>
  Math.round(
    Math.min(APP_LAYOUT_MAX_WIDTH, Math.max(APP_LAYOUT_MIN_WIDTH, value)),
  );

const AppLayoutResizeHandle = ({
  panelRef,
  onResize,
  onReset,
  onResizingChange,
}: {
  panelRef: React.RefObject<HTMLElement | null>;
  onResize: (width: number) => void;
  onReset: () => void;
  onResizingChange: (resizing: boolean) => void;
}) => {
  const drag = React.useRef<{ startX: number; startWidth: number } | null>(
    null,
  );

  const stopDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!drag.current) {
      return;
    }

    drag.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    onResizingChange(false);
  };

  return (
    <button
      type="button"
      aria-label="Resize sidebar"
      title="Resize sidebar"
      className="group/resize absolute inset-y-0 right-0 z-30 w-2 cursor-col-resize touch-none outline-none"
      onDoubleClick={onReset}
      onKeyDown={(event) => {
        const panel = panelRef.current;

        if (
          !panel ||
          (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')
        ) {
          return;
        }

        event.preventDefault();
        onResize(
          clampWidth(
            panel.offsetWidth +
              (event.key === 'ArrowRight'
                ? APP_LAYOUT_KEYBOARD_STEP
                : -APP_LAYOUT_KEYBOARD_STEP),
          ),
        );
      }}
      onPointerCancel={stopDrag}
      onPointerDown={(event) => {
        const panel = panelRef.current;

        if (event.button !== 0 || !panel) {
          return;
        }

        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { startX: event.clientX, startWidth: panel.offsetWidth };
        onResizingChange(true);
      }}
      onPointerMove={(event) => {
        if (!drag.current) {
          return;
        }

        const { startX, startWidth } = drag.current;

        onResize(clampWidth(startWidth + event.clientX - startX));
      }}
      onPointerUp={stopDrag}
    >
      <span className="absolute inset-y-0 right-0 w-0.5 bg-transparent transition-colors duration-150 group-hover/resize:bg-primary/40 group-focus-visible/resize:bg-primary group-active/resize:bg-primary" />
    </button>
  );
};

const AppLayoutFloatingButton = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
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
const AppLayoutFooter = ({ children }: { children?: React.ReactNode }) =>
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
  path,
  name,
  icon: Icon,
}: {
  path: string;
  name: string;
  icon?: React.ElementType;
}) => {
  const { pathname } = useLocation();
  const fullPath = `/${path.replace(/^\/+/, '')}`;
  const isActive = pathname === fullPath || pathname.startsWith(`${fullPath}/`);

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={fullPath}>
          {Icon && <Icon />}
          <span className="min-w-0 flex-1 truncate">{name}</span>
        </Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};

const APP_LAYOUT_PAGE_ENTER: Keyframe[] = [{ opacity: 0.4 }, { opacity: 1 }];

const getPageKey = (pathname: string) =>
  pathname.split('/').filter(Boolean).slice(0, 2).join('/');

/** The page pane: replays a short enter on route change, never the sidebar. */
const AppLayoutPage = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const pageRef = React.useRef<HTMLDivElement>(null);
  const pageKey = getPageKey(pathname);
  const previousKey = React.useRef(pageKey);

  React.useLayoutEffect(() => {
    const page = pageRef.current;

    if (previousKey.current === pageKey) {
      return;
    }

    previousKey.current = pageKey;

    if (
      !page?.animate ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const animation = page.animate(APP_LAYOUT_PAGE_ENTER, {
      duration: 160,
      easing: 'ease-out',
    });

    return () => animation.cancel();
  }, [pageKey]);

  return (
    <div
      ref={pageRef}
      className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      {children}
    </div>
  );
};

const AppLayoutDesktop = ({
  atoms,
  children,
  footer,
  sidebar,
  title,
}: {
  atoms: TAppLayoutAtoms;
  children: React.ReactNode;
  sidebar: React.ReactNode;
  footer?: React.ReactNode;
  title?: React.ReactNode;
}) => {
  const [open, setOpen] = useAtom(atoms.open);
  const [width, setWidth] = useAtom(atoms.width);
  const [resizing, setResizing] = React.useState(false);
  const asideRef = React.useRef<HTMLElement>(null);
  const currentWidth = width ?? APP_LAYOUT_DEFAULT_WIDTH;

  return (
    <div
      className={cn(
        'relative flex min-h-0 min-w-0 flex-1',
        !open && '[--navigation-panel-toggle-space:2.5rem]',
        resizing && 'cursor-col-resize select-none',
      )}
    >
      <aside
        ref={asideRef}
        aria-hidden={!open}
        className={cn(
          'relative flex shrink-0 flex-col overflow-hidden border-r bg-sidebar',
          !resizing &&
            'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          !open && 'border-r-0',
        )}
        style={{ width: open ? currentWidth : 0 }}
      >
        <div
          className="flex h-full flex-col"
          style={{ minWidth: currentWidth }}
        >
          <div className="flex h-10 shrink-0 items-center px-2">
            <div className="min-w-0 flex-1 truncate px-2 text-sm font-medium">
              {title}
            </div>
            <Button
              aria-expanded
              aria-label="Collapse sidebar"
              className="size-8 shrink-0 rounded-md"
              size="icon"
              title="Collapse sidebar"
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              <IconLayoutSidebarLeftCollapse />
            </Button>
          </div>
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

const AppLayoutMobile = ({
  children,
  footer,
  sidebar,
  title,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  footer?: React.ReactNode;
  title?: React.ReactNode;
}) => {
  const { toggleSidebar } = Sidebar.useSidebar();

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden [--navigation-panel-toggle-space:2.5rem]">
      <Sidebar collapsible="offcanvas">
        {title && (
          <Sidebar.Header className="px-4 text-sm font-medium">
            {title}
          </Sidebar.Header>
        )}
        <div
          data-navigation-context
          className="styled-scroll min-h-0 flex-1 overflow-y-auto pb-1"
        >
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

const AppLayoutBody = (props: {
  atoms: TAppLayoutAtoms;
  children: React.ReactNode;
  sidebar: React.ReactNode;
  footer?: React.ReactNode;
  title?: React.ReactNode;
}) => {
  const { isMobile } = Sidebar.useSidebar();

  return isMobile ? (
    <AppLayoutMobile {...props} />
  ) : (
    <AppLayoutDesktop {...props} />
  );
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
  sidebar: React.ReactNode;
  footer?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Sidebar.Provider className="min-h-0 flex-1" sidebarKeyboardShortcut={false}>
    <AppLayoutBody
      atoms={getAppLayoutAtoms(id)}
      sidebar={sidebar}
      footer={footer}
      title={title}
    >
      {children}
    </AppLayoutBody>
  </Sidebar.Provider>
);
