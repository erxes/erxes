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
import { useCallback, useEffect, useRef, type KeyboardEvent } from 'react';

import { CSS } from '@dnd-kit/utilities';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import { useTranslation } from 'react-i18next';

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
            'data-[active=true]:border-border data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs',
            isDragging && 'z-10 opacity-60',
          )}
          style={{ transform: CSS.Transform.toString(transform), transition }}
          onClick={onSelect}
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
                'size-4 text-muted-foreground transition-opacity group-hover/tab:opacity-0',
                active && 'text-primary',
                isDragging && 'opacity-0',
              )}
            />
            <IconGripVertical
              aria-hidden
              className={cn(
                'absolute inset-0 size-4 text-muted-foreground opacity-0 transition-opacity group-hover/tab:opacity-100',
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
              active && 'opacity-100',
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
  const tabStopId = tabs.some((tab) => tab.id === activeTabId)
    ? activeTabId
    : tabs[0]?.id;
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
  );

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

    onClose(tabs[index].id);
    if (!restoreFocus) return;
    // Context menus release their focus scope when the closing tab unmounts.
    requestAnimationFrame(() => focusTarget?.focus());
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
    onSelect(tabs[nextIndex].id);
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
              onSelect={() => onSelect(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};
