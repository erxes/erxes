import React from 'react';

import { useDndContext } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Header } from '@tanstack/react-table';
import { cva } from 'class-variance-authority';

import { Table } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib/utils';

import { useRecordTable } from './RecordTableProvider';

export const recordTableHeadVariants = cva(
  'sticky z-[2] top-0 transition-transform duration-200 whitespace-nowrap text-xs',
  {
    variants: {
      isDragging: {
        true: 'z-[3]',
      },
      isPinned: {
        left: 'z-[3]',
        right: 'z-[3]',
      },
    },
  },
);

export const RecordTableHead = ({
  header,
  children,
  ...props
}: React.ComponentProps<'th'> & {
  header: Header<any, unknown>;
}) => {
  const { column } = header;
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
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
      )}
      style={{
        width: `calc(var(--header-${column.id}-size) * 1px)`,
        left:
          column.getIsPinned() === 'left'
            ? `${column.getStart('left')}px`
            : undefined,
      }}
      {...props}
    >
      {children}
      {header.column.id !== 'checkbox' && header.column.id !== 'more' && (
        <>
          <span
            {...attributes}
            {...listeners}
            tabIndex={-1}
            className="absolute top-0 left-0 w-full h-full focus:outline-none"
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
  column: Column<any, unknown>;
  isDragging: boolean;
}) => {
  const { over, active } = useDndContext();
  const { table } = useRecordTable();
  const columnsOrder = table.getState().columnOrder;

  if (over?.id === column.id && !isDragging && active?.id) {
    if (!table.getState().columnPinning?.left?.includes(over.id as string)) {
      const activeIndex = columnsOrder.indexOf(active.id as string);
      const overIndex = columnsOrder.indexOf(over.id as string);
      const isOnRight = activeIndex < overIndex;
      return (
        <div
          className={cn(
            'absolute top-0 w-0.5 bg-primary/40 h-screen',
            isOnRight ? 'right-0' : 'left-0',
          )}
        />
      );
    }
  }

  return null;
};

const RecordTableHeadSize = React.forwardRef<
  HTMLTableCellElement,
  React.ComponentProps<'span'> & {
    header: Header<any, unknown>;
  }
>(({ header, children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={cn(
        'absolute bottom-0 cursor-col-resize w-4 h-full right-0 z-10 select-none touch-none after:absolute after:inset-y-2 after:w-px after:right-0 hover:after:bg-border',
        header.column.getIsResizing() &&
          'after:w-0.5 hover:after:bg-primary after:inset-y-1',
      )}
      {...props}
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
    />
  );
});
