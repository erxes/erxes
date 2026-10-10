import { useTranslation } from 'react-i18next';
import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';
import { AdjustFixedAssetDetail } from '@/adjustments/fxa/components/AdjustFixedAssetDetail';

export const AdjustFixedAssetDetailPage = () => {
  const { t } = useTranslation('accounting');
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/adjustment/fxa"
        returnText={t('Fixed asset')}
      />
      <AdjustFixedAssetDetail />
    </AccountingLayout>
  );
};
