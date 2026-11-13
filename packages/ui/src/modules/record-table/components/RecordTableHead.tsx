import React from 'react';

import { useDndContext } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Column, Header } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';

import { Table } from 'erxes-ui/components/table';
import { cn } from 'erxes-ui/lib/utils';
import { isStructuralColumn } from 'erxes-ui/modules/record-table/utils/columnUtils';

import { useRecordTable } from './RecordTableProvider';

const recordTableHeadVariants = cva(
  'sticky z-2 top-0 transition-transform duration-200 whitespace-nowrap text-xs [&_svg]:flex-none',
  {
    variants: {
      isDragging: {
        true: 'z-3',
      },
      isPinned: {
        left: 'z-3',
        right: 'z-3',
      },
    },
  },
);

export const RecordTableHead = ({
  header,
  children,
  className,
  ...props
}: React.ComponentProps<'th'> & {
  header: Header<unknown, unknown>;
}) => {
  const { column } = header;

  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
    id: column.id,
    disabled: !!column.getIsPinned(),
  });

  return (
    <Table.Head
      ref={setNodeRef}
      className={cn(
        recordTableHeadVariants({
          isDragging,
          isPinned:
            column.getIsPinned() === 'left'
              ? 'left'
              : column.getIsPinned() === 'right'
                ? 'right'
                : null,
        }),
        className,
      )}
      style={{
        width: `var(--header-${column.id}-width)`,
        left: column.getIsPinned() === 'left' ? `${column.getStart('left')}px` : undefined,
      }}
      {...props}
    >
      {children}
      {!isStructuralColumn(column.id) && (
        <>
          <span
            {...attributes}
            {...listeners}
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
          <RecordTableOverLine column={column} isDragging={isDragging} />
        </>
      )}
    </Table.Head>
  );
};

const RecordTableOverLine = ({
  column,
  isDragging,
}: {
  column: Column<unknown>;
  isDragging: boolean;
}) => {
  const { over, active } = useDndContext();
  const { table } = useRecordTable();
  const { columnOrder, columnPinning } = table.getState();

  if (over?.id !== column.id || isDragging || !active?.id) return null;

  if (columnPinning.left?.includes(column.id)) return null;

  const isOnRight = columnOrder.indexOf(String(active.id)) < columnOrder.indexOf(column.id);

  return (
    <div
      className={cn(
        'absolute top-0 w-0.5 bg-primary/40 h-screen',
        isOnRight ? 'right-0' : 'left-0',
      )}
    />
  );
};

/** The handle that resizes a column; like the column reorder, it is pointer-only. */
const RecordTableHeadSize = ({ header }: { header: Header<unknown, unknown> }) => (
  <span
    aria-hidden
    className={cn(
      'absolute bottom-0 cursor-col-resize w-4 h-full right-0 z-10 select-none touch-none after:absolute after:inset-y-2 after:w-px after:right-0 hover:after:bg-border',
      header.column.getIsResizing() && 'after:w-0.5 hover:after:bg-primary after:inset-y-1',
    )}
    onMouseDown={header.getResizeHandler()}
    onTouchStart={header.getResizeHandler()}
  />
);
