import {
  closestCenter,
  CollisionDetection,
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  pointerWithin,
  PointerSensor,
  rectIntersection,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconPlus, IconX } from '@tabler/icons-react';
import { Button, cn, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ILayoutRow,
  isRowId,
  rowId,
  useLayoutEditor,
} from '../hooks/useLayoutEditor';

// A dragged row only ever lands among rows.
// For a chip, where the pointer is decides the row; nearest edge is only the
// fallback, and a chip under the pointer beats its row so a drop keeps its spot.
const collisionDetection: CollisionDetection = (args) => {
  if (isRowId(String(args.active.id))) {
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter(({ id }) =>
        isRowId(String(id)),
      ),
    });
  }

  const hits = pointerWithin(args);
  const chips = hits.filter(({ id }) => !isRowId(String(id)));

  if (chips.length) {
    return chips;
  }

  return hits.length ? hits : rectIntersection(args);
};

// Rows resize as chips move between them, so measure them every frame.
const MEASURING = { droppable: { strategy: MeasuringStrategy.Always } };

export interface ILayoutItem {
  id: string;
  name: string;
  // Off where records show, but kept placed for when it is turned back on.
  dimmed?: boolean;
}

export const LayoutEditor = ({
  title,
  items,
  initialRows,
  saving,
  onSave,
  onClose,
}: {
  title: string;
  items: ILayoutItem[];
  initialRows: string[][];
  saving: boolean;
  onSave: (layout: string[][] | null) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const {
    rows,
    activeId,
    handleDragStart,
    handleDragCancel,
    handleDragOver,
    handleDragEnd,
    addRow,
    removeRow,
    saveLayout,
    resetLayout,
  } = useLayoutEditor({ initialRows, onSave });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );
  const itemById = new Map(items.map((item) => [item.id, item]));
  const activeRow =
    activeId && isRowId(activeId)
      ? rows.find((row) => rowId(row.key) === activeId)
      : undefined;
  const activeItem =
    activeId && !activeRow ? itemById.get(activeId) : undefined;

  return (
    <>
      <Sheet.Header>
        <Sheet.Title>{title}</Sheet.Title>
        <Sheet.Description className="sr-only">
          {t(
            'layout-description',
            'Drag fields between rows. Fields in a row share its width, up to 4.',
          )}
        </Sheet.Description>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="flex flex-col gap-2 overflow-y-auto p-5">
        <p className="text-sm text-muted-foreground">
          {t(
            'layout-description',
            'Drag fields between rows. Fields in a row share its width, up to 4.',
          )}
        </p>
        <DndContext
          sensors={sensors}
          collisionDetection={collisionDetection}
          measuring={MEASURING}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext
            items={rows.map((row) => rowId(row.key))}
            strategy={verticalListSortingStrategy}
          >
            {rows.map((row) => (
              <LayoutRow
                key={row.key}
                row={row}
                itemById={itemById}
                onRemove={() => removeRow(row.key)}
              />
            ))}
          </SortableContext>
          <DragOverlay>
            {activeRow && (
              <RowBody className="bg-background shadow-md">
                {activeRow.ids.map((id) => (
                  <ChipBody
                    key={id}
                    label={itemById.get(id)?.name ?? id}
                    dimmed={itemById.get(id)?.dimmed}
                  />
                ))}
              </RowBody>
            )}
            {activeItem && (
              <ChipBody
                label={activeItem.name}
                dimmed={activeItem.dimmed}
                className="shadow-md"
              />
            )}
          </DragOverlay>
        </DndContext>
        <Button variant="secondary" className="self-start" onClick={addRow}>
          <IconPlus />
          {t('add-row', 'Add row')}
        </Button>
      </Sheet.Content>
      <Sheet.Footer>
        <Button
          variant="ghost"
          className="mr-auto"
          disabled={saving}
          onClick={resetLayout}
        >
          {t('reset-layout', 'Reset')}
        </Button>
        <Button variant="ghost" onClick={onClose}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={saving} onClick={saveLayout}>
          {t('save', 'Save')}
        </Button>
      </Sheet.Footer>
    </>
  );
};

const RowBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'flex min-h-11 items-center gap-2 rounded-md border border-dashed p-1.5',
      className,
    )}
  >
    <IconGripVertical className="size-4 shrink-0 text-muted-foreground" />
    {children}
  </div>
);

// The row is the drop target for chips and, by its handle, a sortable item itself.
const LayoutRow = ({
  row,
  itemById,
  onRemove,
}: {
  row: ILayoutRow;
  itemById: Map<string, ILayoutItem>;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    active,
  } = useSortable({ id: rowId(row.key) });
  const chipOver = isOver && !!active && !isRowId(String(active.id));

  return (
    <SortableContext items={row.ids} strategy={rectSortingStrategy}>
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        className={cn(
          'flex min-h-11 items-center gap-2 rounded-md border border-dashed p-1.5',
          chipOver && 'border-primary',
          isDragging && 'opacity-40',
        )}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="flex shrink-0 cursor-grab items-center text-muted-foreground"
          aria-label={t('move-row', 'Move row')}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical className="size-4" />
        </button>
        {row.ids.map((id) => (
          <LayoutChip
            key={id}
            id={id}
            label={itemById.get(id)?.name ?? id}
            dimmed={itemById.get(id)?.dimmed}
          />
        ))}
        {!row.ids.length && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto size-8 text-muted-foreground"
            title={t('remove-row', 'Remove row')}
            aria-label={t('remove-row', 'Remove row')}
            onClick={onRemove}
          >
            <IconX />
          </Button>
        )}
      </div>
    </SortableContext>
  );
};

const ChipBody = ({
  label,
  dimmed,
  className,
}: {
  label: string;
  dimmed?: boolean;
  className?: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 cursor-grab items-center gap-1 rounded bg-muted px-2 py-1.5 text-sm',
        dimmed && 'text-muted-foreground opacity-60',
        className,
      )}
      title={
        dimmed
          ? t('layout-hidden-hint', 'Hidden where records show')
          : undefined
      }
    >
      <IconGripVertical className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="truncate">{label}</span>
    </div>
  );
};

// The dragged copy follows the pointer in the overlay; this stays as its placeholder.
const LayoutChip = ({
  id,
  label,
  dimmed,
}: {
  id: string;
  label: string;
  dimmed?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn('flex min-w-0 flex-1', isDragging && 'opacity-40')}
      {...attributes}
      {...listeners}
    >
      <ChipBody label={label} dimmed={dimmed} />
    </div>
  );
};
