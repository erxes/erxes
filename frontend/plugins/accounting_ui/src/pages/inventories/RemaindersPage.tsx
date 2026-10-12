import { useTranslation } from 'react-i18next';
import { PageSubHeader } from 'erxes-ui';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { AccountingLayout } from '~/modules/layout/components/Layout';
import { ProductsFilter } from '~/modules/inventories/remainders/components/ProductsFilter';
import { ProductsRecordTable } from '~/modules/inventories/remainders/components/ProductsRecordTable';
import { ReCalcRemainderForm } from '~/modules/inventories/remainders/components/ReCalcRemainderForm';
import { RemainderDetailSheet } from '~/modules/inventories/remainders/components/RemainderDetailSheet';

export const RemaindersPage = () => {
  const { t } = useTranslation('accounting');
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/inventories/remainders"
        returnText={t('Live Remainders')}
        skipSettings={true}
      >
        <ReCalcRemainderForm />
      </AccountingHeader>
      <PageSubHeader>
        <ProductsFilter />
      </PageSubHeader>
      <ProductsRecordTable />
      <RemainderDetailSheet />
    </AccountingLayout>
  );
};
