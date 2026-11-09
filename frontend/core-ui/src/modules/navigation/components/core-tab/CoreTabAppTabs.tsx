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
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  IconApps,
  IconArrowBarToRight,
  IconGripVertical,
  IconX,
} from '@tabler/icons-react';
import { Button, ContextMenu, cn } from 'erxes-ui';
import { useCallback, useEffect, useRef } from 'react';

import { CSS } from '@dnd-kit/utilities';
import { INavigationActivity } from '@/navigation/types/NavigationActivity';
import type { CoreTabOrientation } from '@/navigation/components/core-tab/CoreTab';
import { useTranslation } from 'react-i18next';

const CoreTabAppTab = ({
  activity,
  active,
  vertical,
  canCloseOthers,
  canCloseToRight,
  onClose,
  onCloseOthers,
  onCloseToRight,
  onSelect,
}: Readonly<{
  activity: INavigationActivity;
  active: boolean;
  vertical: boolean;
  canCloseOthers: boolean;
  canCloseToRight: boolean;
  onClose: () => void;
  onCloseOthers: () => void;
  onCloseToRight: () => void;
  onSelect: () => void;
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
          tabIndex={active ? 0 : -1}
          title={
            activity.platformMismatch
              ? `${activity.label} — ${activity.platformMismatch}`
              : activity.label
          }
          data-active={active}
          className={cn(
            'group/tab flex h-7 shrink-0 cursor-default items-center gap-1.5 rounded-md border border-transparent pr-1 pl-2.5 text-sm font-medium text-muted-foreground transition-[background-color,border-color,box-shadow,color,opacity] select-none hover:bg-accent/70 hover:text-foreground',
            'dark:group-data-[framed=true]/layout:text-primary-foreground/80 dark:group-data-[framed=true]/layout:hover:bg-primary-foreground/15 dark:group-data-[framed=true]/layout:hover:text-primary-foreground',
            'data-[active=true]:border-border data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs',
            'group-data-[framed=true]/layout:data-[active=true]:border-transparent group-data-[framed=true]/layout:data-[active=true]:bg-background group-data-[framed=true]/layout:data-[active=true]:text-foreground',
            // The vertical rail shows icons only; the label is in the title.
            vertical ? 'size-8 justify-center px-0' : 'min-w-24 max-w-48',
            isDragging && 'z-10 opacity-60',
          )}
          style={{ transform: CSS.Transform.toString(transform), transition }}
          onClick={onSelect}
          onAuxClick={(event) => {
            // Middle click closes, like a browser tab.
            if (event.button === 1) {
              event.preventDefault();
              onClose();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelect();
            }
          }}
        >
          {/* On hover the icon turns into a grip: tabs can be dragged. */}
          <span className="relative size-4 shrink-0">
            <Icon
              className={cn(
                'size-4 text-muted-foreground transition-opacity group-hover/tab:opacity-0 dark:group-data-[framed=true]/layout:text-current',
                active &&
                  'text-primary dark:group-data-[framed=true]/layout:text-primary',
                isDragging && 'opacity-0',
              )}
            />
            <IconGripVertical
              aria-hidden
              className={cn(
                'absolute inset-0 size-4 text-muted-foreground opacity-0 transition-opacity group-hover/tab:opacity-100 dark:group-data-[framed=true]/layout:text-current',
                isDragging && 'opacity-100',
              )}
            />
          </span>
          {!vertical && (
            <span className="min-w-0 flex-1 truncate">{activity.label}</span>
          )}
          {!vertical && activity.platformMismatch && (
            <span
              aria-label={activity.platformMismatch}
              className="size-1.5 shrink-0 rounded-full bg-amber-500"
            />
          )}
          <Button
            hidden={vertical}
            aria-label={closeLabel}
            className={cn(
              'size-5 shrink-0 rounded text-muted-foreground opacity-0 transition-[background-color,opacity] hover:bg-accent hover:text-foreground group-hover/tab:opacity-100 group-focus-within/tab:opacity-100',
              'dark:group-data-[framed=true]/layout:text-current dark:group-data-[framed=true]/layout:hover:bg-primary-foreground/15',
              active &&
                'opacity-100 dark:group-data-[framed=true]/layout:text-muted-foreground dark:group-data-[framed=true]/layout:hover:bg-accent dark:group-data-[framed=true]/layout:hover:text-foreground',
            )}
            size="icon"
            title={closeLabel}
            type="button"
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
        <ContextMenu.Item onSelect={onClose}>
          <IconX />
          {closeLabel}
        </ContextMenu.Item>
        <ContextMenu.Item disabled={!canCloseOthers} onSelect={onCloseOthers}>
          <IconX />
          {t('close-other-tabs', 'Close other tabs')}
        </ContextMenu.Item>
        <ContextMenu.Item disabled={!canCloseToRight} onSelect={onCloseToRight}>
          <IconArrowBarToRight />
          {vertical
            ? t('close-tabs-below', 'Close tabs below')
            : t('close-tabs-to-right', 'Close tabs to the right')}
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu>
  );
};

/** Browser-like app tabs: click to switch, × or middle click to close, drag to reorder. */
export const CoreTabAppTabs = ({
  activeTabId,
  orientation = 'horizontal',
  tabs,
  onClose,
  onCloseOthers,
  onCloseToRight,
  onMove,
  onSelect,
}: Readonly<{
  activeTabId?: string;
  orientation?: CoreTabOrientation;
  tabs: INavigationActivity[];
  onClose: (tabId: string) => void;
  onCloseOthers: (tabId: string) => void;
  onCloseToRight: (tabId: string) => void;
  onMove: (fromId: string, toId: string) => void;
  onSelect: (tabId: string) => void;
}>) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const vertical = orientation === 'vertical';
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

  return (
    <DndContext
      autoScroll={false}
      collisionDetection={closestCenter}
      modifiers={[
        vertical ? restrictToVerticalAxis : restrictToHorizontalAxis,
        restrictToParentElement,
      ]}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <div
        role="tablist"
        aria-label={t('plugins')}
        aria-orientation={orientation}
        className={cn(
          'hide-scroll flex min-w-0 flex-1 items-center gap-1',
          vertical ? 'min-h-0 flex-col overflow-y-auto' : 'overflow-x-auto',
        )}
      >
        <SortableContext
          items={tabs.map((tab) => tab.id)}
          strategy={
            vertical
              ? verticalListSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          {tabs.map((tab, index) => (
            <CoreTabAppTab
              key={tab.id}
              activity={tab}
              active={tab.id === activeTabId}
              vertical={vertical}
              canCloseOthers={tabs.length > 1}
              canCloseToRight={index < tabs.length - 1}
              onClose={() => onClose(tab.id)}
              onCloseOthers={() => onCloseOthers(tab.id)}
              onCloseToRight={() => onCloseToRight(tab.id)}
              onSelect={() => onSelect(tab.id)}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};
