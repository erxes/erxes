import { useQueryState } from 'erxes-ui';
import { AccountingLayout } from '@/layout/components/Layout';
import { AccountingHeader } from '@/layout/components/Header';
import { AdjustDebtRateDetail } from '../modules/adjustments/debt/components/AdjustDebtRateDetail';

export const AdjustDebtRateDetailPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/adjustment/debRate"
        returnText="Debt Rate"
      />
      <AdjustDebtRateDetail />
    </AccountingLayout>
  );
};
