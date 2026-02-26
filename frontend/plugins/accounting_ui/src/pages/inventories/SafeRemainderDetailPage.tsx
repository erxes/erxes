import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { SafeRemainderDetail } from '~/modules/inventories/safeRemainders/components/SafeRemainderDetail';

export const SafeRemainderDetailPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/inventories/safe-remainders"
        returnText="Safe Remainders"
        skipSettings={true}
      ></AccountingHeader>
      <SafeRemainderDetail />
    </AccountingLayout>
  );
};
