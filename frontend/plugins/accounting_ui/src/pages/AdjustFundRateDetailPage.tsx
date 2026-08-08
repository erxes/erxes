import { useQueryState } from 'erxes-ui';
import { AccountingLayout } from '@/layout/components/Layout';
import { AccountingHeader } from '@/layout/components/Header';
import { AdjustFundRateDetail } from '@/adjustments/rate/components/AdjustFundRateDetail';

export const AdjustFundRateDetailPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/adjustment/fundRate"
        returnText="Fund Rate"
      />
      <AdjustFundRateDetail />
    </AccountingLayout>
  );
};
