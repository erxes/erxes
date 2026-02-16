import { AdjustClosingDetail } from '~/modules/adjustments/closing/components/AdjustClosingDetail';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { AccountingLayout } from '~/modules/layout/components/Layout';

export const AdjustClosingDetailPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/adjustment/closing"
        returnText="Closing"
      ></AccountingHeader>
      <AdjustClosingDetail />
    </AccountingLayout>
  );
};
