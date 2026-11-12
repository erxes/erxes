import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { horizontalListSortingStrategy, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconArrowBarToRight, IconGripVertical, IconX } from '@tabler/icons-react';
import { Button, cn, ContextMenu } from 'erxes-ui';
import { type KeyboardEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { NavApp } from './apps';

/** The app's icon; on hover it turns into a grip, as tabs can be dragged. */
const TabIcon = ({
  icon: Icon,
  active,
  dragging,
}: {
  icon: NavApp['icon'];
  active: boolean;
  dragging: boolean;
}) => (
  <span className="relative size-4 shrink-0">
    <Icon
      className={cn(
        'size-4 text-muted-foreground transition-opacity group-hover/tab:opacity-0',
        active && 'text-primary',
        dragging && 'opacity-0',
      )}
    />
    <IconGripVertical
      aria-hidden
      className={cn(
        'absolute inset-0 size-4 text-muted-foreground opacity-0 transition-opacity group-hover/tab:opacity-100',
        dragging && 'opacity-100',
      )}
    />
  </span>
);

/** ×, shown on the active tab and on hover; it never starts a drag. */
const TabCloseButton = ({
  label,
  active,
  onClose,
}: {
  label: string;
  active: boolean;
  onClose: () => void;
}) => (
  <Button
    aria-label={label}
    title={label}
    className={cn(
      'size-5 shrink-0 rounded text-muted-foreground opacity-0 transition-[background-color,opacity] hover:bg-accent hover:text-foreground group-focus-within/tab:opacity-100 group-hover/tab:opacity-100',
      active && 'opacity-100',
    )}
    size="icon"
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
);

interface TabMenuActions {
  canCloseOthers: boolean;
  canCloseToRight: boolean;
  onCloseOthers: () => void;
  onCloseToRight: () => void;
}

/** Right click: close this tab, the others, or those to its right. */
const TabMenu = ({
  closeLabel,
  onClose,
  canCloseOthers,
  canCloseToRight,
  onCloseOthers,
  onCloseToRight,
}: TabMenuActions & { closeLabel: string; onClose: () => void }) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  return (
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
        {t('close-tabs-to-right', 'Close tabs to the right')}
      </ContextMenu.Item>
    </ContextMenu.Content>
  );
};

const CoreTabAppTab = ({
  app,
  active,
  onSelect,
  onClose,
  onKeyDown,
  ...menu
}: TabMenuActions & {
  app: NavApp;
  active: boolean;
  onSelect: () => void;
  onClose: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: app.id,
  });

  const ref = useRef<HTMLDivElement | null>(null);
  const closeLabel = t('close-tab', { page: app.label, defaultValue: `Close ${app.label}` });

  useEffect(() => {
    if (active) ref.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);

  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>
        <div
          {...attributes}
          {...listeners}
          ref={(node) => {
            ref.current = node;
            setNodeRef(node);
          }}
          role="tab"
          aria-selected={active}
          tabIndex={active ? 0 : -1}
          title={app.label}
          data-active={active}
          className={cn(
            'group/tab flex h-7 min-w-24 max-w-48 shrink-0 cursor-default select-none items-center gap-1.5 rounded-md border border-transparent pl-2.5 pr-1 text-sm font-medium text-muted-foreground transition-[background-color,border-color,box-shadow,color,opacity] hover:bg-accent/70 hover:text-foreground',
            'data-[active=true]:border-border data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-xs',
            isDragging && 'z-10 opacity-60',
          )}
          style={{ transform: CSS.Transform.toString(transform), transition }}
          onClick={onSelect}
          onMouseDown={(event) => {
            // Middle click must not take focus before it closes the tab.
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
              onClose();
            }
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelect();
            } else onKeyDown(event);
          }}
        >
          <TabIcon icon={app.icon} active={active} dragging={isDragging} />
          <span className="min-w-0 flex-1 truncate">{app.label}</span>
          <TabCloseButton label={closeLabel} active={active} onClose={onClose} />
        </div>
      </ContextMenu.Trigger>
      <TabMenu closeLabel={closeLabel} onClose={onClose} {...menu} />
    </ContextMenu>
  );
};

/** Browser-like app tabs: click to switch, × or middle click to close, drag to reorder. */
export const CoreTabAppTabs = ({
  tabs,
  activeId,
  onSelect,
  onClose,
  onCloseOthers,
  onCloseToRight,
  onMove,
}: {
  tabs: NavApp[];
  activeId?: string;
  onSelect: (app: NavApp) => void;
  onClose: (id: string) => void;
  onCloseOthers: (id: string) => void;
  onCloseToRight: (id: string) => void;
  onMove: (fromId: string, toId: string) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const listRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) onMove(String(active.id), String(over.id));
  };

  // Arrow keys move between tabs, Home/End jump to the ends.
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    const targets: Record<string, number> = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: tabs.length - 1,
    };

    const next = targets[event.key];

    if (next === undefined || next < 0 || next >= tabs.length) return;

    event.preventDefault();
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
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
        ref={listRef}
        role="tablist"
        aria-label={t('plugins', 'Apps')}
        aria-orientation="horizontal"
        className="hide-scroll flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
      >
        <SortableContext items={tabs.map((tab) => tab.id)} strategy={horizontalListSortingStrategy}>
          {tabs.map((app, index) => (
            <CoreTabAppTab
              key={app.id}
              app={app}
              active={app.id === activeId}
              canCloseOthers={tabs.length > 1}
              canCloseToRight={index < tabs.length - 1}
              onSelect={() => onSelect(app)}
              onClose={() => onClose(app.id)}
              onCloseOthers={() => onCloseOthers(app.id)}
              onCloseToRight={() => onCloseToRight(app.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};
