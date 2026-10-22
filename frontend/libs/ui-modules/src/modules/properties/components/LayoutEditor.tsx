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
import {
  IconGripVertical,
  IconLock,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { Button, cn, Sheet } from 'erxes-ui';
import { createContext, useContext } from 'react';
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

export interface ILayoutAsideApi {
  placedIds: Set<string>;
  placeItem: (id: string) => void;
  unplaceItem: (id: string) => void;
}

const ChipRenderContext = createContext<
  ((item: ILayoutItem) => React.ReactNode) | undefined
>(undefined);

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
  header,
  footer,
  renderChip,
  aside,
}: {
  title: string;
  items: ILayoutItem[];
  initialRows: string[][];
  saving: boolean;
  onSave: (layout: string[][] | null) => void;
  onClose: () => void;
  // Shown above and below the rows, e.g. the fixed parts of the real form.
  header?: React.ReactNode;
  footer?: React.ReactNode;
  // Chip content in place of the plain name, e.g. how the field looks on the form.
  renderChip?: (item: ILayoutItem) => React.ReactNode;
  // A side panel that can place and unplace fields; replaces the pool.
  aside?: (api: ILayoutAsideApi) => React.ReactNode;
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
    placeItem,
    unplaceItem,
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
  const placedIds = new Set(rows.flatMap((row) => row.ids));

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
      <Sheet.Content
        className={cn(
          aside
            ? 'flex min-h-0 p-0'
            : 'flex flex-col gap-2 overflow-y-auto p-5',
        )}
      >
        <ChipRenderContext.Provider value={renderChip}>
          <div
            className={cn(
              'flex flex-col gap-2',
              aside && 'min-w-0 flex-1 overflow-y-auto p-5',
            )}
          >
            <p className="text-sm text-muted-foreground">
              {t(
                'layout-description',
                'Drag fields between rows. Fields in a row share its width, up to 4.',
              )}
            </p>

            {header}
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
                    onUnplace={aside ? unplaceItem : undefined}
                    showLock={!!aside}
                  />
                ))}
              </SortableContext>
              <DragOverlay>
                {activeRow && (
                  <RowBody className="bg-background shadow-md">
                    {activeRow.ids.map((id) => (
                      <ChipBody
                        key={id}
                        item={itemById.get(id)}
                        label={itemById.get(id)?.name ?? id}
                        dimmed={itemById.get(id)?.dimmed}
                      />
                    ))}
                  </RowBody>
                )}
                {activeItem && (
                  <ChipBody
                    item={activeItem}
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
            {footer}
          </div>
        </ChipRenderContext.Provider>
        {aside && (
          <div className="flex w-80 shrink-0 flex-col overflow-y-auto border-l">
            {aside({ placedIds, placeItem, unplaceItem })}
          </div>
        )}
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
  onUnplace,
  showLock,
}: {
  row: ILayoutRow;
  itemById: Map<string, ILayoutItem>;
  onRemove: () => void;
  onUnplace?: (id: string) => void;
  showLock?: boolean;
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
            item={itemById.get(id)}
            label={itemById.get(id)?.name ?? id}
            dimmed={itemById.get(id)?.dimmed}
            locked={showLock && itemById.get(id)?.dimmed}
            onUnplace={onUnplace && (() => onUnplace(id))}
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
  item,
  label,
  dimmed,
  locked,
  className,
  onUnplace,
}: {
  item?: ILayoutItem;
  label: string;
  dimmed?: boolean;
  locked?: boolean;
  className?: string;
  onUnplace?: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'properties' });
  const renderChip = useContext(ChipRenderContext);

  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 cursor-grab items-center gap-1 rounded bg-muted px-2 py-1.5 text-sm',
        dimmed && 'text-muted-foreground opacity-60',
        className,
      )}
      title={
        locked
          ? t(
              'layout-locked-hint',
              'Turned off for this form in Settings → Properties',
            )
          : dimmed
          ? t('layout-hidden-hint', 'Hidden where records show')
          : undefined
      }
    >
      {locked ? (
        <IconLock className="size-3.5 shrink-0 text-muted-foreground" />
      ) : (
        <IconGripVertical className="size-3.5 shrink-0 text-muted-foreground" />
      )}
      {renderChip && item ? (
        <div className="min-w-0 flex-1">{renderChip(item)}</div>
      ) : (
        <span className="truncate">{label}</span>
      )}
      {onUnplace && (
        <button
          type="button"
          className="ml-auto flex shrink-0 items-center text-muted-foreground hover:text-foreground"
          aria-label={t('layout-unplace', 'Remove from the form')}
          title={t('layout-unplace', 'Remove from the form')}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onUnplace}
        >
          <IconX className="size-3.5" />
        </button>
      )}
    </div>
  );
};

// The dragged copy follows the pointer in the overlay; this stays as its placeholder.
const LayoutChip = ({
  id,
  item,
  label,
  dimmed,
  locked,
  onUnplace,
}: {
  id: string;
  item?: ILayoutItem;
  label: string;
  dimmed?: boolean;
  locked?: boolean;
  onUnplace?: () => void;
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
      <ChipBody
        item={item}
        label={label}
        dimmed={dimmed}
        locked={locked}
        onUnplace={onUnplace}
      />
    </div>
  );
};
