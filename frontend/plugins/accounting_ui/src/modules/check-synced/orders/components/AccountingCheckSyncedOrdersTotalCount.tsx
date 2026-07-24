import { useAtomValue } from 'jotai';
import { CheckSyncedTotalCount } from '~/modules/check-synced/components/CheckSyncedTotalCount';
import {
  accountingCheckSyncedOrdersStatusCountsAtom,
  accountingCheckSyncedOrdersTotalCountAtom,
} from '../states';

export const AccountingCheckSyncedOrdersTotalCount = () => {
  const totalCount = useAtomValue(accountingCheckSyncedOrdersTotalCountAtom);
  const counts = useAtomValue(accountingCheckSyncedOrdersStatusCountsAtom);

  return <CheckSyncedTotalCount totalCount={totalCount} counts={counts} />;
};
