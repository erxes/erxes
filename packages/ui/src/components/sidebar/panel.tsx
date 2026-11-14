import React from 'react';
import { createPortal } from 'react-dom';

import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { useLocation } from 'react-router-dom';

import { Button } from 'erxes-ui/components/button';
import { Separator } from 'erxes-ui/components/separator';
import { useIsMobile } from 'erxes-ui/hooks/use-mobile';
import { cn, mergeRefs } from 'erxes-ui/lib/utils';
import { sidebarPanelOpenState, sidebarPanelOpenedAtState } from 'erxes-ui/state/sidebarPanelState';
import { useTranslation } from 'react-i18next';

const SIDEBAR_PANEL_SLOT = '[data-sidebar-panel-slot]';

const findSidebarPanelSlot = (panel: HTMLElement | null) => {
  let node = panel?.parentElement ?? null;

  while (node) {
    const slot = node.querySelector<HTMLElement>(SIDEBAR_PANEL_SLOT);

    if (slot) {
      return slot;
    }

    node = node.parentElement;
  }

  return null;
};

const SidebarPanelInnerTriggerHiddenContext = React.createContext(false);

/**
 * Whether the panel is open. On a desktop it stays as the member left it. On a phone it covers
 * the page, so it starts closed and closes once you pick a page in it.
 */
const useSidebarPanelOpen = () => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const [desktopOpen, setDesktopOpen] = useAtom(sidebarPanelOpenState);
  const [openedAt, setOpenedAt] = useAtom(sidebarPanelOpenedAtState);

  if (!isMobile) return { isMobile, open: desktopOpen, setOpen: setDesktopOpen };

  return {
    isMobile,
    open: openedAt === pathname,
    setOpen: (open: boolean) => setOpenedAt(open ? pathname : null),
  };
};

const isSlotAbovePanel = (slot: HTMLElement, panel: HTMLElement | null) =>
  Boolean(panel && slot.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING);

const useSidebarPanelSlot = (panelRef: React.RefObject<HTMLDivElement | null>, open: boolean) => {
  const [slot, setSlot] = React.useState<HTMLElement | null>(null);
  const [claimed, setClaimed] = React.useState(false);

  React.useLayoutEffect(() => {
    const found = findSidebarPanelSlot(panelRef.current);

    if (!found || (open && !isSlotAbovePanel(found, panelRef.current))) {
      setSlot(null);
      setClaimed(false);

      return;
    }

    const owner = found.dataset.sidebarPanelSlot === '';

    if (owner) {
      found.dataset.sidebarPanelSlot = 'claimed';
    }

    setSlot(found);
    setClaimed(owner);

    return () => {
      if (owner) {
        found.dataset.sidebarPanelSlot = '';
      }
    };
  }, [open, panelRef]);

  return { slot, claimed };
};

export const SidebarPanelTrigger = ({
  ref,
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) => {
  const hidden = React.useContext(SidebarPanelInnerTriggerHiddenContext);
  const { open, setOpen } = useSidebarPanelOpen();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  const toggleLabel = open
    ? t('collapse-sidebar', 'Collapse sidebar')
    : t('expand-sidebar', 'Expand sidebar');

  if (hidden) {
    return null;
  }

  return (
    <Button
      ref={ref}
      aria-expanded={open}
      aria-label={toggleLabel}
      className={cn('size-6 shrink-0 rounded-md', className)}
      size="icon"
      title={toggleLabel}
      variant="ghost"
      onClick={(event) => {
        onClick?.(event);
        setOpen(!open);
      }}
      {...props}
    >
      {open ? <IconLayoutSidebarLeftCollapse /> : <IconLayoutSidebarLeftExpand />}
    </Button>
  );
};

export const SidebarPanel = ({
  ref,
  className,
  children,
  label,
  actions,
  ...props
}: React.ComponentProps<'div'> & {
  label?: React.ReactNode;
  actions?: React.ReactNode;
}) => {
  const { isMobile, open } = useSidebarPanelOpen();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const { slot, claimed } = useSidebarPanelSlot(panelRef, open);
  const triggerInSlot = Boolean(slot && claimed);

  return (
    <div
      ref={mergeRefs(panelRef, ref)}
      data-sidebar="panel"
      data-state={open ? 'expanded' : 'collapsed'}
      className={cn(
        'relative flex h-full w-60 flex-col overflow-hidden border-r bg-sidebar text-foreground transition-layout duration-300 ease-out-quint motion-reduce:transition-none',
        className,
        // A phone has no room for a second column, so the panel covers the page's left side.
        isMobile && 'absolute inset-y-0 left-0 z-20 shadow-lg',
        !open && 'w-0! overflow-visible border-0! shadow-none',
      )}
      {...props}
    >
      {slot &&
        claimed &&
        createPortal(
          <span className="contents">
            <SidebarPanelTrigger className="size-7" />
            <Separator.Inline />
          </span>,
          slot,
        )}
      {!open && !slot && (
        <div className="absolute top-2.5 left-2 z-20 navigation-collapsed:left-12">
          <SidebarPanelTrigger className="size-7 border bg-background shadow-xs" />
        </div>
      )}
      <SidebarPanelInnerTriggerHiddenContext.Provider value={triggerInSlot}>
        {open && label && (
          // Clears the app sidebar's expand button, which floats over the page's top left corner.
          <div className="flex h-10 shrink-0 items-center gap-1 px-2 navigation-collapsed:pl-12">
            <span className="min-w-0 flex-1 truncate px-2 text-sm font-medium">{label}</span>
            {actions}
            <SidebarPanelTrigger className="size-8" />
          </div>
        )}
        <div hidden={!open} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </SidebarPanelInnerTriggerHiddenContext.Provider>
    </div>
  );
};
