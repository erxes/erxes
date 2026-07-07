import { AccountingLayout } from '@/layout/components/Layout';
import { SafeRemainderDetail } from '~/modules/inventories/safeRemainders/components/SafeRemainderDetail';

export const SafeRemainderDetailPage = () => {
  return (
    <AccountingLayout>
      <SafeRemainderDetail />
    </AccountingLayout>
  );
};
