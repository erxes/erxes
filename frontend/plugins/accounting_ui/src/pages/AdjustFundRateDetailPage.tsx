import { useTranslation } from 'react-i18next';
import { AccountingLayout } from '@/layout/components/Layout';
import { AccountingHeader } from '@/layout/components/Header';
import { AdjustFundRateDetail } from '@/adjustments/rate/components/AdjustFundRateDetail';

export const AdjustFundRateDetailPage = () => {
  const { t } = useTranslation('accounting');
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/adjustment/fundRate"
        returnText={t('fund-rate')}
      />
      <AdjustFundRateDetail />
    </AccountingLayout>
  );
};
