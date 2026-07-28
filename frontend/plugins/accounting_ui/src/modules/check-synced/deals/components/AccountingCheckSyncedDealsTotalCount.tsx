import { useAtomValue } from 'jotai';
import { CheckSyncedTotalCount } from '~/modules/check-synced/components/CheckSyncedTotalCount';
import {
  accountingCheckSyncedDealsStatusCountsAtom,
  accountingCheckSyncedDealsTotalCountAtom,
} from '../states';

export const AccountingCheckSyncedDealsTotalCount = () => {
  const totalCount = useAtomValue(accountingCheckSyncedDealsTotalCountAtom);
  const counts = useAtomValue(accountingCheckSyncedDealsStatusCountsAtom);

  return <CheckSyncedTotalCount totalCount={totalCount} counts={counts} />;
};
