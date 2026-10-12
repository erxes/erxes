import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { AdjustClosingDetail } from '~/modules/adjustments/closing/components/AdjustClosingDetail';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { AccountingLayout } from '~/modules/layout/components/Layout';

export const AdjustClosingDetailPage = () => {
  const { t } = useTranslation('accounting');
  const { id } = useParams();

  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/adjustment/closing"
        returnText={t('Closing')}
      />
      <AdjustClosingDetail id={id} />
    </AccountingLayout>
  );
};
