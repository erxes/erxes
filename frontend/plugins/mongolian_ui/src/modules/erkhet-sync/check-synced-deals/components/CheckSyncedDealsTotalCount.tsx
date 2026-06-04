import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { checkSyncedDealsTotalCountAtom } from '../states/checkSyncedDealsCounts';

export const CheckSyncedDealsTotalCount = () => {
  const totalCount = useAtomValue(checkSyncedDealsTotalCountAtom);

  return (
    <div className="text-muted-foreground font-medium text-sm flex flex-wrap gap-x-3 gap-y-1 min-h-7 leading-7">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        <span>{totalCount} records</span>
      )}
    </div>
  );
};
