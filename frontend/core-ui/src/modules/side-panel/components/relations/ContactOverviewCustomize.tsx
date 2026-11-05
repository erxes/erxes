import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconAdjustmentsHorizontal,
  IconGripVertical,
  IconPin,
  IconPinFilled,
} from '@tabler/icons-react';
import { Button, cn, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TContactOverviewEntry } from './contactOverviewEntries';

const CustomizeItem = ({
  entry,
  isTab,
  onToggleTab,
}: {
  entry: TContactOverviewEntry;
  isTab: boolean;
  onToggleTab: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: entry.key });
  const EntryIcon = entry.icon;
  const pinLabel = isTab
    ? t('remove-from-tabs', 'Remove from tabs')
    : t('show-as-tab', 'Show as tab');

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex h-8 items-center gap-1.5 rounded-sm px-1 hover:bg-accent',
        isDragging && 'relative z-10 bg-accent shadow-sm',
      )}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="flex size-6 cursor-grab items-center justify-center rounded-sm text-muted-foreground active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={t('drag-to-reorder', 'Drag to reorder')}
        {...attributes}
        {...listeners}
      >
        <IconGripVertical className="size-4" />
      </button>
      {EntryIcon && <EntryIcon className="size-4 text-muted-foreground" />}
      <span className="min-w-0 flex-1 truncate text-sm">{entry.label}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn('size-7', !isTab && 'text-muted-foreground')}
        aria-pressed={isTab}
        aria-label={pinLabel}
        title={pinLabel}
        onClick={onToggleTab}
      >
        {isTab ? (
          <IconPinFilled className="size-4" />
        ) : (
          <IconPin className="size-4" />
        )}
      </Button>
    </div>
  );
};

/**
 * Arranges a contact overview: drag modules into order, pin some as their
 * own panel tabs. Saved in this browser only.
 */
export const ContactOverviewCustomize = ({
  entries,
  tabs,
  onReorder,
  onToggleTab,
}: {
  entries: TContactOverviewEntry[];
  tabs: string[];
  onReorder: (keys: string[]) => void;
  onToggleTab: (key: string) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const keys = entries.map((entry) => entry.key);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    onReorder(
      arrayMove(
        keys,
        keys.indexOf(String(active.id)),
        keys.indexOf(String(over.id)),
      ),
    );
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 flex-none"
          aria-label={t('customize', 'Customize')}
          title={t('customize', 'Customize')}
        >
          <IconAdjustmentsHorizontal className="size-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-64 p-1.5">
        <p className="px-1.5 pb-1.5 text-xs text-muted-foreground">
          {t('customize-relations', 'Drag to reorder. Pin to show as a tab.')}
        </p>
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          sensors={sensors}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={keys} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-0.5">
              {entries.map((entry) => (
                <CustomizeItem
                  key={entry.key}
                  entry={entry}
                  isTab={tabs.includes(entry.key)}
                  onToggleTab={() => onToggleTab(entry.key)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Popover.Content>
    </Popover>
  );
};
