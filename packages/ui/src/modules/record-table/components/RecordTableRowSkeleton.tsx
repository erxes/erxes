import { useOnInView } from 'react-intersection-observer';
import { Skeleton } from 'erxes-ui/components/skeleton';
import { Table } from 'erxes-ui/components/table';
import { cn } from 'erxes-ui/lib/utils';
import { useRecordTableState } from './RecordTableProvider';

/**
 * How far below the visible area the forward placeholder counts as in view: one screen of rows,
 * so the next page is on its way while that screen still scrolls, instead of only once the
 * member reaches the end. Not above: a backward page keeps the rows where they are on screen,
 * so it loads only once the top is reached.
 */
const FORWARD_AHEAD = '0px 0px 100% 0px';

/**
 * Placeholder rows; `handleInView` runs when the first one comes within a screen below the
 * visible area (in view, for a `backward` one), and again each time `loaded` changes while it
 * stays there: a scroll that outruns a page still gets the next one, instead of waiting for the
 * row to leave and come back. `handleInView` guards against a fetch already running.
 */
export const RecordTableRowSkeleton = ({
  rows = 1,
  handleInView,
  loaded,
  backward,
  root,
}: {
  rows?: number;
  handleInView?: () => void;
  /** Rows loaded so far. */
  loaded?: number;
  backward?: boolean;
  root?: Element | null;
}) => {
  const ref = useOnInView<HTMLTableRowElement>(
    (inView) => {
      if (inView) handleInView?.();
    },
    { root: root ?? null, rootMargin: backward ? undefined : FORWARD_AHEAD },
  );

  // Positions after the first row: the rows are identical, so a position is their identity.
  const restRows = [...Array(Math.max(rows - 1, 0)).keys()];

  return (
    <>
      {/* A new row per `loaded`: its new observer reports at once when it is still in view. */}
      <SkeletonRow key={`watched-${loaded ?? 0}`} ref={ref} />
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
  // Read in the selector: the table object is stable, so a read here would be cached.
  const columnIds = useRecordTableState((_state, table) =>
    table.getVisibleLeafColumns().map((column) => column.id),
  );

  return (
    <Table.Row ref={ref} className={cn('h-cell', className)} {...props}>
      {columnIds.map((columnId) => (
        <Table.Cell key={columnId} className="border-r-0 px-2 group-hover/table-row:bg-background">
          <Skeleton className="h-4 w-full min-w-4" />
        </Table.Cell>
      ))}
    </Table.Row>
  );
};
