import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { AdjustFixedAssetDetail } from '@/adjustments/fxa/components/AdjustFixedAssetDetail';

export const AdjustFixedAssetDetailPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/adjustment/fxa"
        returnText="Fixed asset"
      />
      <AdjustFixedAssetDetail />
    </AccountingLayout>
  );
};
