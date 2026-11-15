import { Skeleton } from '../../components/skeleton';
import { RecordListProvider, useRecordListSelection } from './RecordListProvider';
import { RecordListRoot } from './RecordListRoot';

/** Stands in for the rows while they load. */
const RecordListSkeleton = ({ rows = 8 }: { rows?: number }) => (
  <div className="flex flex-col gap-2 p-3" aria-busy>
    {Array.from({ length: rows }, (_, index) => (
      <Skeleton key={`row-${String(index)}`} className="h-8" />
    ))}
  </div>
);

/**
 * Rows grouped under headers that fold away, such as tasks by status.
 * Each group's sticky header picks all its rows, and folded groups are kept in this browser.
 * Wrap it in `RecordList.Provider`, which holds the selection `RecordList.useSelection` reads
 * for a bulk command bar.
 */
export const RecordList = Object.assign(RecordListRoot, {
  Provider: RecordListProvider,
  Skeleton: RecordListSkeleton,
  useSelection: useRecordListSelection,
});
