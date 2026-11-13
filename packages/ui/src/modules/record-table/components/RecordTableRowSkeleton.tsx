import { useInView } from 'react-intersection-observer';
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
  const { ref } = useInView({
    root: root ?? null,
    onChange: (inView) => {
      if (inView) handleInView?.();
    },
  });

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
