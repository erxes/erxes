import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { syncErkhetHistoryTotalCountAtom } from '../states/syncErkhetHistoryCounts';

export const SyncErkhetHistoryTotalCount = () => {
  const totalCount = useAtomValue(syncErkhetHistoryTotalCountAtom);
  return (
    <div className="text-muted-foreground font-medium text-sm whitespace-nowrap h-7 leading-7">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        `${totalCount} records found`
      )}
    </div>
  );
};
