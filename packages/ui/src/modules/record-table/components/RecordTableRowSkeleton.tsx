// TanStack Table v8 hands out one mutable table, row and column object and changes what their
// getters return in place. Compiled, these reads would be cached on objects that never change,
// and selection, sizing and column order would stop showing. TanStack Table 9's store fixes this.
'use no memo';

import { useOnInView } from 'react-intersection-observer';
import { Skeleton } from 'erxes-ui/components/skeleton';
import { Table } from 'erxes-ui/components/table';
import { cn } from 'erxes-ui/lib/utils';
import { useRecordTable } from './RecordTableProvider';

/** Placeholder rows; `handleInView` runs when the first one scrolls into view. */
export const RecordTableRowSkeleton = ({
  rows = 1,
  handleInView,
  backward,
  root,
}: {
  rows?: number;
  handleInView?: () => void;
  backward?: boolean;
  root?: Element | null;
}) => {
  const ref = useOnInView<HTMLTableRowElement>(
    (inView) => {
      if (inView) handleInView?.();
    },
    { root: root ?? null },
  );

  // Positions after the first row: the rows are identical, so a position is their identity.
  const restRows = [...Array(Math.max(rows - 1, 0)).keys()];

  return (
    <>
      <SkeletonRow ref={ref} />
      {restRows.map((position) => (
        <SkeletonRow
          key={position}
          className={cn(backward && position === rows - 2 && '[&>td]:border-b-0')}
        />
      ))}
    </>
  );
};

const SkeletonRow = ({ ref, className, ...props }: React.ComponentProps<'tr'>) => {
  const { table } = useRecordTable();

  return (
    <Table.Row ref={ref} className={cn('h-cell', className)} {...props}>
      {table.getVisibleLeafColumns().map((column) => (
        <Table.Cell key={column.id} className="border-r-0 px-2 group-hover/table-row:bg-background">
          <Skeleton className="h-4 w-full min-w-4" />
        </Table.Cell>
      ))}
    </Table.Row>
  );
};
