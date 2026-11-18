import React, { useRef } from 'react';
import { IconArrowDown, IconArrowUp, IconArrowsSort } from '@tabler/icons-react';

import { useDndContext } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';

import { Table } from 'erxes-ui/components/table';
import { cn } from 'erxes-ui/lib/utils';
import { isStructuralColumn } from 'erxes-ui/modules/record-table/utils/columnUtils';

import type { Header, RowData } from '@tanstack/react-table';
import {
  useRecordTable,
  useRecordTableState,
  type RecordTableFeatures,
  type TRecordTableSort,
} from './RecordTableProvider';

type RecordTableHeader = Header<RecordTableFeatures, RowData>;

const recordTableHeadVariants = cva(
  'sticky z-2 top-0 w-(--head-width) transition-transform duration-200 whitespace-nowrap text-xs [&_svg]:flex-none',
  {
    variants: {
      isDragging: { true: 'z-3' },
      pinned: { true: 'z-3 left-(--head-start)' },
    },
  },
);

// What the button shows for each order, and what a press does next.
const SORT_BUTTON = {
  none: { Icon: IconArrowsSort, label: 'sort-ascending', english: 'Sort ascending' },
  asc: { Icon: IconArrowUp, label: 'sort-descending', english: 'Sort descending' },
  desc: { Icon: IconArrowDown, label: 'clear-sort', english: 'Clear sort' },
} as const;

const ARIA_SORT = { asc: 'ascending', desc: 'descending', none: 'none' } as const;

// Longer than this between press and release is a hold that drags the column, not a click.
const CLICK_MS = 300;

/** Off → ascending → descending → off. */
export const nextSort = (sort: TRecordTableSort | null, by: string): TRecordTableSort | null => {
  if (sort?.by !== by) return { by, direction: 'asc' };

  return sort.direction === 'asc' ? { by, direction: 'desc' } : null;
};

/** The header's sort control: the order shown, and a button for the keyboard. */
const SortButton = ({
  direction,
  onSort,
}: {
  direction: TRecordTableSort['direction'] | undefined;
  onSort: () => void;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'table' });
  const { Icon, label, english } = SORT_BUTTON[direction ?? 'none'];

  return (
    <button
      type="button"
      aria-label={t(label, english)}
      className={cn(
        'relative z-1 ml-1 inline-flex size-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring',
        !direction && 'opacity-0 group-hover/head:opacity-100',
      )}
      onClick={(event) => {
        event.stopPropagation();
        onSort();
      }}
    >
      <Icon className="size-3.5" aria-hidden />
    </button>
  );
};

/**
 * A header cell: drag it to reorder its column, drag its right edge to resize it, click it to
 * sort by it when the table sorts (`RecordTable.Provider`'s `sortable`).
 */
export const RecordTableHead = ({
  header,
  pinned,
  children,
  className,
  ...props
}: React.ComponentProps<'th'> & {
  header: RecordTableHeader;
  pinned: boolean;
}) => {
  const { id } = header.column;
  const { headId, sorting } = useRecordTable();
  const pressedAt = useRef(0);
  const sortable = Boolean(sorting?.columns.includes(id));
  const direction = sorting?.sort?.by === id ? sorting.sort.direction : undefined;
  const sort = () => sorting?.onChange(nextSort(sorting.sort, id));

  const { isDragging, listeners, setNodeRef, transform } = useSortable({
    id,
    disabled: pinned,
  });

  return (
    <Table.Head
      ref={setNodeRef}
      id={headId(id)}
      className={cn(
        recordTableHeadVariants({ isDragging, pinned }),
        sortable && 'group/head cursor-pointer',
        className,
      )}
      style={{
        '--head-width': `var(--header-${header.id}-width)`,
        '--head-start': pinned ? `var(--col-${id}-start)` : undefined,
      }}
      aria-sort={sortable ? ARIA_SORT[direction ?? 'none'] : undefined}
      onPointerDown={sortable ? () => (pressedAt.current = Date.now()) : undefined}
      onClick={
        sortable
          ? () => {
              if (Date.now() - pressedAt.current < CLICK_MS) sort();
            }
          : undefined
      }
      {...props}
    >
      {sortable ? (
        <div className="flex items-center">
          {children}
          <SortButton direction={direction} onSort={sort} />
        </div>
      ) : (
        children
      )}
      {!isStructuralColumn(id) && (
        <>
          {/* Pointer-only drag area: a role="button" inside the header would hide its name. */}
          <span
            {...listeners}
            aria-hidden
            tabIndex={-1}
            className="absolute top-0 left-0 w-full h-full focus:outline-hidden"
          />

          {isDragging && (
            <div
              className="sortable absolute top-0 left-0 w-full h-screen bg-muted opacity-50"
              style={{ '--sortable-transform': CSS.Translate.toString(transform) }}
            />
          )}

          <RecordTableHeadSize header={header} />
          <RecordTableOverLine columnId={id} isDragging={isDragging} />
        </>
      )}
    </Table.Head>
  );
};

/** While a column is dragged, the line on the side where it would land. */
const RecordTableOverLine = ({
  columnId,
  isDragging,
}: {
  columnId: string;
  isDragging: boolean;
}) => {
  const { over, active } = useDndContext();
  const activeId = active?.id === undefined ? undefined : String(active.id);

  const side = useRecordTableState(({ columnOrder, columnPinning }) => {
    if (over?.id !== columnId || isDragging || !activeId) return null;

    if (columnPinning.start?.includes(columnId)) return null;

    return columnOrder.indexOf(activeId) < columnOrder.indexOf(columnId) ? 'right' : 'left';
  });

  if (!side) return null;

  return (
    <div
      className={cn(
        'absolute top-0 w-0.5 bg-primary/40 h-screen',
        side === 'right' ? 'right-0' : 'left-0',
      )}
    />
  );
};

/** The handle that resizes a column; like the column reorder, it is pointer-only. */
const RecordTableHeadSize = ({ header }: { header: RecordTableHeader }) => {
  const resizing = useRecordTableState(
    (state) => state.columnResizing.isResizingColumn === header.column.id,
  );

  const startResize = header.getResizeHandler();

  return (
    <span
      aria-hidden
      className={cn(
        'absolute bottom-0 cursor-col-resize w-4 h-full right-0 z-10 select-none touch-none after:absolute after:inset-y-2 after:w-px after:right-0 hover:after:bg-border',
        resizing && 'after:w-0.5 hover:after:bg-primary after:inset-y-1',
      )}
      onMouseDown={startResize}
      onTouchStart={startResize}
    />
  );
};
