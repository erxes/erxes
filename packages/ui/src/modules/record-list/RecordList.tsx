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

export const RecordList = Object.assign(RecordListRoot, {
  Provider: RecordListProvider,
  Skeleton: RecordListSkeleton,
  useSelection: useRecordListSelection,
});
