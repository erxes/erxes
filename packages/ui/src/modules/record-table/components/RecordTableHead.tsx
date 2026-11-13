import React from 'react';

import { useDndContext } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cva } from 'class-variance-authority';

import { Table } from 'erxes-ui/components/table';
import { cn } from 'erxes-ui/lib/utils';
import { isStructuralColumn } from 'erxes-ui/modules/record-table/utils/columnUtils';

import type { Header, RowData } from '@tanstack/react-table';
import {
  useRecordTable,
  useRecordTableState,
  type RecordTableFeatures,
} from './RecordTableProvider';

type RecordTableHeader = Header<RecordTableFeatures, RowData>;

const recordTableHeadVariants = cva(
  'sticky z-2 top-0 transition-transform duration-200 whitespace-nowrap text-xs [&_svg]:flex-none',
  {
    variants: {
      isDragging: { true: 'z-3' },
      pinned: { true: 'z-3' },
    },
  },
);

/** A header cell: drag it to reorder its column, drag its right edge to resize it. */
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
  const { headId } = useRecordTable();

  const { isDragging, listeners, setNodeRef, transform } = useSortable({
    id,
    disabled: pinned,
  });

  return (
    <Table.Head
      ref={setNodeRef}
      id={headId(id)}
      className={cn(recordTableHeadVariants({ isDragging, pinned }), className)}
      style={{
        width: `var(--header-${header.id}-width)`,
        left: pinned ? `var(--col-${id}-start)` : undefined,
      }}
      {...props}
    >
      {children}
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
              className="absolute top-0 left-0 w-full h-screen bg-muted opacity-50"
              style={{ transform: CSS.Translate.toString(transform) }}
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
