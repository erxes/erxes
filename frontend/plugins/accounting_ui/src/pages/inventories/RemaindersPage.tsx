import { PageSubHeader } from 'erxes-ui';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { AccountingLayout } from '~/modules/layout/components/Layout';
import { ProductsFilter } from '~/modules/inventories/remainders/components/ProductsFilter';
import { ProductsRecordTable } from '~/modules/inventories/remainders/components/ProductsRecordTable';
import { ReCalcRemainderForm } from '~/modules/inventories/remainders/components/ReCalcRemainderForm';
import { RemainderDetailSheet } from '~/modules/inventories/remainders/components/RemainderDetailSheet';

export const RemaindersPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink="/accounting/inventories/remainders"
        returnText="Live Remainders"
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
