import { useTranslation } from 'react-i18next';
import { AccountingLayout } from '@/layout/components/Layout';
import { AccountingHeader } from '@/layout/components/Header';
import { AdjustInventoryDetail } from '@/adjustments/inventories/components/AdjustInventoryDetail';

export const AdjustInventoryDetailPage = () => {
  const { t } = useTranslation('accounting');
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/adjustment/inventory"
        returnText={t('inventory')}
      ></AccountingHeader>
      <AdjustInventoryDetail />
    </AccountingLayout>
  );
};
