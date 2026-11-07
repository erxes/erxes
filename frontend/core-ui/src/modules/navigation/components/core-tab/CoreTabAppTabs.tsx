import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToHorizontalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  IconApps,
  IconArrowBarToRight,
  IconGripVertical,
  IconX,
} from '@tabler/icons-react';
import { Button, ContextMenu, cn } from 'erxes-ui';
import {
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import { CSS } from '@dnd-kit/utilities';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { useTranslation } from 'react-i18next';
import { UNSAFE_DataRouterStateContext } from 'react-router-dom';

const recoverCanceledTabFocus = (
  source: HTMLElement | undefined,
  dialog: HTMLElement | null,
  onDone: () => void,
): (() => void) | undefined => {
  if (!source?.isConnected) {
    onDone();
    return;
  }

  let frame = 0;
  const stop = () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    document.removeEventListener('pointerdown', cancel, true);
  };
  const cancel = () => {
    stop();
    onDone();
  };
  const restore = () => {
    if (dialog?.isConnected) return;

    observer.disconnect();
    // Let the dialog's focus scope finish unmounting before recovering focus.
    frame = requestAnimationFrame(() => {
      if (source.isConnected && document.activeElement === document.body) {
        source.focus();
      }
      cancel();
    });
  };
  const observer = new MutationObserver(restore);

  observer.observe(document.body, { childList: true, subtree: true });
  // A later pointer action owns focus, even on a non-focusable target.
  document.addEventListener('pointerdown', cancel, true);
  restore();

  return stop;
};

const CoreTabAppTab = ({
  activity,
  active,
  tabbable,
  canCloseOthers,
  canCloseToRight,
  onClose,
  onCloseOthers,
  onCloseToRight,
  onSelect,
  onFocus,
  onBlur,
  onKeyDown,
}: Readonly<{
  activity: INavigationActivity;
  active: boolean;
  tabbable: boolean;
  canCloseOthers: boolean;
  canCloseToRight: boolean;
  onClose: (restoreFocus?: boolean) => void;
  onCloseOthers: () => void;
  onCloseToRight: () => void;
  onSelect: () => void;
  onFocus: (element: HTMLDivElement) => void;
  onBlur: (nextTarget: EventTarget | null) => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const tabRef = useRef<HTMLDivElement | null>(null);
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: activity.id });
  const Icon = activity.icon || IconApps;
  const closeLabel = t('close-tab', { page: activity.label });

  const setTabRef = useCallback(
    (node: HTMLDivElement | null) => {
      tabRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef],
  );

  useEffect(() => {
    if (active) {
      tabRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [active]);

  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>
        <div
          {...attributes}
          {...listeners}
          ref={setTabRef}
          role="tab"
          aria-selected={active}
          tabIndex={tabbable ? 0 : -1}
          title={
            activity.platformMismatch
              ? `${activity.label} — ${activity.platformMismatch}`
              : activity.label
          }
          data-active={active}
          className={cn(
            'group/tab flex h-7 min-w-24 max-w-48 shrink-0 cursor-default items-center gap-1.5 rounded-md border border-transparent pr-1 pl-2.5 text-sm font-medium text-muted-foreground transition-[background-color,border-color,box-shadow,color,opacity] select-none hover:bg-accent/70 hover:text-foreground',
            'group-data-[notch=true]/layout:text-primary-foreground/80 group-data-[notch=true]/layout:hover:bg-primary-foreground/15 group-data-[notch=true]/layout:hover:text-primary-foreground',
            'data-[active=true]:border-border data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs',
            'group-data-[notch=true]/layout:data-[active=true]:border-transparent group-data-[notch=true]/layout:data-[active=true]:bg-background group-data-[notch=true]/layout:data-[active=true]:text-foreground',
            isDragging && 'z-10 opacity-60',
          )}
          style={{ transform: CSS.Transform.toString(transform), transition }}
          onClick={onSelect}
          onFocus={(event) => onFocus(event.currentTarget)}
          onBlur={(event) => onBlur(event.relatedTarget)}
          onMouseDown={(event) => {
            // Keep middle-click from taking focus before the close event.
            if (event.button === 1) {
              event.preventDefault();
              return;
            }
            listeners?.onMouseDown?.(event);
          }}
          onAuxClick={(event) => {
            // Middle click closes, like a browser tab.
            if (event.button === 1) {
              event.preventDefault();
              onClose(
                active || event.currentTarget.contains(document.activeElement),
              );
            }
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelect();
              return;
            }
            onKeyDown(event);
          }}
        >
          {/* On hover the icon turns into a grip: tabs can be dragged. */}
          <span className="relative size-4 shrink-0">
            <Icon
              className={cn(
                'size-4 text-muted-foreground transition-opacity group-hover/tab:opacity-0 group-data-[notch=true]/layout:text-current',
                active && 'text-primary group-data-[notch=true]/layout:text-primary',
                isDragging && 'opacity-0',
              )}
            />
            <IconGripVertical
              aria-hidden
              className={cn(
                'absolute inset-0 size-4 text-muted-foreground opacity-0 transition-opacity group-hover/tab:opacity-100 group-data-[notch=true]/layout:text-current',
                isDragging && 'opacity-100',
              )}
            />
          </span>
          <span className="min-w-0 flex-1 truncate">{activity.label}</span>
          {activity.platformMismatch && (
            <span
              aria-label={activity.platformMismatch}
              className="size-1.5 shrink-0 rounded-full bg-amber-500"
            />
          )}
          <Button
            aria-label={closeLabel}
            className={cn(
              'size-5 shrink-0 rounded text-muted-foreground opacity-0 transition-[background-color,opacity] hover:bg-accent hover:text-foreground group-hover/tab:opacity-100 group-focus-within/tab:opacity-100',
              'group-data-[notch=true]/layout:text-current group-data-[notch=true]/layout:hover:bg-primary-foreground/15',
              active &&
                'opacity-100 group-data-[notch=true]/layout:text-muted-foreground group-data-[notch=true]/layout:hover:bg-accent group-data-[notch=true]/layout:hover:text-foreground',
            )}
            size="icon"
            title={closeLabel}
            type="button"
            tabIndex={-1}
            variant="ghost"
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <IconX className="size-3" />
          </Button>
        </div>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item onSelect={() => onClose()}>
          <IconX />
          {closeLabel}
        </ContextMenu.Item>
        <ContextMenu.Item disabled={!canCloseOthers} onSelect={onCloseOthers}>
          <IconX />
          {t('close-other-tabs', 'Close other tabs')}
        </ContextMenu.Item>
        <ContextMenu.Item disabled={!canCloseToRight} onSelect={onCloseToRight}>
          <IconArrowBarToRight />
          {t('close-tabs-to-right', 'Close tabs to the right')}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
};

/** Browser-like app tabs: click to switch, × or middle click to close, drag to reorder. */
export const CoreTabAppTabs = ({
  activeTabId,
  tabs,
  onClose,
  onCloseOthers,
  onCloseToRight,
  onMove,
  onSelect,
}: Readonly<{
  activeTabId?: string;
  tabs: INavigationActivity[];
  onClose: (tabId: string) => void;
  onCloseOthers: (tabId: string) => void;
  onCloseToRight: (tabId: string) => void;
  onMove: (fromId: string, toId: string) => void;
  onSelect: (tabId: string) => void;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const routerState = useContext(UNSAFE_DataRouterStateContext);
  const focusedTabRef = useRef<HTMLDivElement | null>(null);
  const [focusedTabId, setFocusedTabId] = useState(activeTabId);
  const pendingFocusRef = useRef<{
    tabId: string;
    action: 'close' | 'select';
    target: HTMLElement | null | undefined;
    source: HTMLElement | undefined;
    locationKey: string | undefined;
    wasBlocked: boolean;
  } | null>(null);
  const selectedTabStopId = tabs.some((tab) => tab.id === activeTabId)
    ? activeTabId
    : tabs[0]?.id;
  const tabStopId = tabs.some((tab) => tab.id === focusedTabId)
    ? focusedTabId
    : selectedTabStopId;
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
  );

  useEffect(() => {
    setFocusedTabId(activeTabId);
  }, [activeTabId]);

  useLayoutEffect(() => {
    const pending = pendingFocusRef.current;
    const focusedTabRemoved =
      focusedTabRef.current && !focusedTabRef.current.isConnected;
    if (
      pending?.action === 'select' &&
      routerState?.location.key !== pending.locationKey
    ) {
      pendingFocusRef.current = null;
      return;
    }

    const pendingTabPresent = tabs.some((tab) => tab.id === pending?.tabId);
    const blockers = Array.from(routerState?.blockers.values() ?? []);

    if (
      pending &&
      pendingTabPresent &&
      blockers.some((b) => b.state === 'blocked')
    ) {
      pending.wasBlocked = true;
      return;
    }

    const canceled =
      pending?.wasBlocked &&
      pendingTabPresent &&
      routerState?.location.key === pending.locationKey &&
      routerState?.navigation.state === 'idle' &&
      blockers.every((blocker) => blocker.state === 'unblocked');

    if (canceled && pending) {
      return recoverCanceledTabFocus(
        pending.source,
        document.querySelector<HTMLElement>('[role="alertdialog"]'),
        () => {
          if (pendingFocusRef.current === pending)
            pendingFocusRef.current = null;
        },
      );
    }

    if ((!pending && !focusedTabRemoved) || pendingTabPresent) return;

    pendingFocusRef.current = null;
    focusedTabRef.current = null;
    // A dirty editor can delay removal until its leave dialog is confirmed.
    requestAnimationFrame(() => {
      const target = pending?.target?.isConnected
        ? pending.target
        : tabListRef.current?.querySelector<HTMLElement>(
            '[role="tab"][tabindex="0"]',
          ) ??
          tabListRef.current
            ?.closest('header')
            ?.querySelector<HTMLButtonElement>(
              'button[aria-haspopup="dialog"]',
            );

      target?.focus();
    });
  }, [routerState, tabs]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (
      over &&
      active.id !== over.id &&
      typeof active.id === 'string' &&
      typeof over.id === 'string'
    ) {
      onMove(active.id, over.id);
    }
  };

  const handleClose = (index: number, restoreFocus = true) => {
    const tabElements =
      tabListRef.current?.querySelectorAll<HTMLElement>('[role="tab"]');
    const survivor = index < tabs.length - 1 ? index + 1 : index - 1;
    const focusTarget =
      tabElements?.[survivor] ??
      tabListRef.current
        ?.closest('header')
        ?.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]');

    pendingFocusRef.current = restoreFocus
      ? {
          tabId: tabs[index].id,
          action: 'close',
          target: focusTarget,
          source: tabElements?.[index],
          locationKey: routerState?.location.key,
          wasBlocked: false,
        }
      : null;
    onClose(tabs[index].id);
  };

  const handleSelect = (index: number) => {
    pendingFocusRef.current =
      tabs[index].id === activeTabId
        ? null
        : {
            tabId: tabs[index].id,
            action: 'select',
            target: undefined,
            source:
              tabListRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[
                index
              ],
            locationKey: routerState?.location.key,
            wasBlocked: false,
          };
    onSelect(tabs[index].id);
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    index: number,
  ) => {
    const tabElements =
      tabListRef.current?.querySelectorAll<HTMLElement>('[role="tab"]');
    const lastIndex = tabs.length - 1;
    let nextIndex: number;

    switch (event.key) {
      case 'ArrowRight':
        nextIndex = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
        nextIndex = (index + lastIndex) % tabs.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = lastIndex;
        break;
      case 'Delete':
      case 'Backspace': {
        event.preventDefault();
        handleClose(index);
        return;
      }
      default:
        return;
    }

    event.preventDefault();
    tabElements?.[nextIndex]?.focus();
    handleSelect(nextIndex);
  };

  return (
    <DndContext
      autoScroll={false}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis, restrictToParentElement]}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <div
        ref={tabListRef}
        role="tablist"
        aria-label={t('plugins')}
        className="hide-scroll flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
      >
        <SortableContext
          items={tabs.map((tab) => tab.id)}
          strategy={horizontalListSortingStrategy}
        >
          {tabs.map((tab, index) => (
            <CoreTabAppTab
              key={tab.id}
              activity={tab}
              active={tab.id === activeTabId}
              tabbable={tab.id === tabStopId}
              canCloseOthers={tabs.length > 1}
              canCloseToRight={index < tabs.length - 1}
              onClose={(restoreFocus) => handleClose(index, restoreFocus)}
              onCloseOthers={() => onCloseOthers(tab.id)}
              onCloseToRight={() => onCloseToRight(tab.id)}
              onSelect={() => handleSelect(index)}
              onFocus={(element) => {
                focusedTabRef.current = element;
                setFocusedTabId(tab.id);
                if (pendingFocusRef.current?.tabId === tab.id) {
                  pendingFocusRef.current = null;
                }
              }}
              onBlur={(nextTarget) => {
                if (
                  nextTarget instanceof Node &&
                  !tabListRef.current?.contains(nextTarget)
                ) {
                  focusedTabRef.current = null;
                }
              }}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};
