import React from 'react';
import { useInView } from 'react-intersection-observer';

import { Skeleton, Table } from 'erxes-ui/components';

import { useRecordTable } from './RecordTableProvider';
import { cn } from 'erxes-ui/lib';

export const RecordTableRowSkeleton = ({
  rows = 1,
  handleInView,
  backward,
}: {
  rows?: number;
  handleInView?: () => void;
  backward?: boolean;
}) => {
  // get column count
  const { table } = useRecordTable();
  const columnCount = table.getRowModel().rows[0]?.getVisibleCells().length;
  const { ref } = useInView({
    onChange: (inView) => {
      inView && handleInView && handleInView();
    },
  });

  return (
    <>
      <SkeletonRow ref={ref} columnCount={columnCount} />
      {Array.from({ length: rows - 1 }).map((_, index) => (
        <SkeletonRow
          key={index}
          columnCount={columnCount}
          className={cn(backward && index === rows - 2 && '[&>td]:border-b-0')}
        />
      ))}
    </>
  );
};

const SkeletonRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    columnCount: number;
  }
>(({ columnCount, className, ...props }, ref) => {
  return (
    <Table.Row ref={ref} className={cn('h-cell', className)} {...props}>
      {Array.from({ length: columnCount }).map((_, index) => (
        <Table.Cell
          key={index}
          className={cn('border-r-0 px-2 group-hover/table-row:bg-background')}
        >
          <Skeleton className="h-4 w-full min-w-4" />
        </Table.Cell>
      ))}
    </Table.Row>
  );
});
