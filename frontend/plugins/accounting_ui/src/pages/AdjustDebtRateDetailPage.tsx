import { useTranslation } from 'react-i18next';
import { AccountingLayout } from '@/layout/components/Layout';
import { AccountingHeader } from '@/layout/components/Header';
import { AdjustDebtRateDetail } from '../modules/adjustments/debt/components/AdjustDebtRateDetail';

export const AdjustDebtRateDetailPage = () => {
  const { t } = useTranslation('accounting');
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/adjustment/debRate"
        returnText={t('debt-rate')}
      />
      <AdjustDebtRateDetail />
    </AccountingLayout>
  );
};
