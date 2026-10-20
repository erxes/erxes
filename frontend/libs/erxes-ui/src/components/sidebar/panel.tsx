import * as React from 'react';

import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
} from '@tabler/icons-react';
import { useAtom, useAtomValue } from 'jotai';

import { Button } from 'erxes-ui/components/button';
import { Separator } from 'erxes-ui/components/separator';
import { cn } from 'erxes-ui/lib/utils';
import { Portal } from 'radix-ui';
import { sidebarPanelOpenState } from 'erxes-ui/state/sidebarPanelState';
import { useComposedRef } from './hooks';
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

const isSlotAbovePanel = (slot: HTMLElement, panel: HTMLElement | null) =>
  Boolean(
    panel &&
      slot.compareDocumentPosition(panel) & Node.DOCUMENT_POSITION_FOLLOWING,
  );

const useSidebarPanelSlot = (
  panelRef: React.RefObject<HTMLDivElement | null>,
  open: boolean,
) => {
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

export const SidebarPanelTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const hidden = React.useContext(SidebarPanelInnerTriggerHiddenContext);
  const [open, setOpen] = useAtom(sidebarPanelOpenState);
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
      {open ? (
        <IconLayoutSidebarLeftCollapse />
      ) : (
        <IconLayoutSidebarLeftExpand />
      )}
    </Button>
  );
});
SidebarPanelTrigger.displayName = 'SidebarPanelTrigger';

export const SidebarPanel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    label?: React.ReactNode;
    actions?: React.ReactNode;
  }
>(({ className, children, label, actions, ...props }, ref) => {
  const open = useAtomValue(sidebarPanelOpenState);
  const [panelRef, setRefs] = useComposedRef(ref);
  const { slot, claimed } = useSidebarPanelSlot(panelRef, open);
  const triggerInSlot = Boolean(slot && claimed);

  return (
    <div
      ref={setRefs}
      data-sidebar="panel"
      data-state={open ? 'expanded' : 'collapsed'}
      className={cn(
        'relative flex h-full w-60 flex-col overflow-hidden bg-sidebar text-foreground transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
        className,
        !open && 'w-0! overflow-visible border-0!',
      )}
      {...props}
    >
      {slot && claimed && (
        <Portal.Root asChild container={slot}>
          <span className="contents">
            <SidebarPanelTrigger className="size-7" />
            <Separator.Inline />
          </span>
        </Portal.Root>
      )}
      {!open && !slot && (
        <div className="absolute top-2.5 left-2 z-20">
          <SidebarPanelTrigger className="size-7 border bg-background shadow-xs" />
        </div>
      )}
      <SidebarPanelInnerTriggerHiddenContext.Provider value={triggerInSlot}>
        {open && label && (
          <div className="flex h-10 shrink-0 items-center gap-1 px-2">
            <span className="min-w-0 flex-1 truncate px-2 text-sm font-medium">
              {label}
            </span>
            {actions}
            <SidebarPanelTrigger className="size-8" />
          </div>
        )}
        <div
          hidden={!open}
          className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        >
          {children}
        </div>
      </SidebarPanelInnerTriggerHiddenContext.Provider>
    </div>
  );
});
SidebarPanel.displayName = 'SidebarPanel';
