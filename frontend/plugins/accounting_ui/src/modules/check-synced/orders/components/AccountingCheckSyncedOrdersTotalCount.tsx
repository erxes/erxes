import { isUndefinedOrNull, Skeleton } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import {
  accountingCheckSyncedOrdersStatusCountsAtom,
  accountingCheckSyncedOrdersTotalCountAtom,
} from '../states';

export const AccountingCheckSyncedOrdersTotalCount = () => {
  const totalCount = useAtomValue(accountingCheckSyncedOrdersTotalCountAtom);
  const counts = useAtomValue(accountingCheckSyncedOrdersStatusCountsAtom);

  return (
    <div className="text-muted-foreground font-medium text-sm flex flex-wrap gap-x-3 gap-y-1 min-h-7 leading-7">
      {isUndefinedOrNull(totalCount) ? (
        <Skeleton className="w-20 h-4 inline-block mt-1.5" />
      ) : (
        <>
          <span>{totalCount} records</span>
          <span>checked {counts.checked}</span>
          <span>synced {counts.synced}</span>
          <span>skipped {counts.skipped}</span>
          <span>pending {counts.pending}</span>
          <span>error {counts.error}</span>
          <span>resynced {counts.resynced}</span>
          <span>toSync {counts.toSync}</span>
        </>
      )}
    </div>
  );
};
