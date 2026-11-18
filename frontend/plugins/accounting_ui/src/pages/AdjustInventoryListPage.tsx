import { AdjustTable } from '@/adjustments/inventories/components/AdjustTable';
import { AccountingLayout } from '@/layout/components/Layout';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { AdjustmentHeader } from '../modules/adjustments/components/Header';
import { AddAdjustInventory } from '@/adjustments/inventories/components/AdjustInventoryForm';
import { PageSubHeader } from 'erxes-ui';

export const AdjustInventoryListPage = () => {
  return (
    <AccountingLayout>
      <AdjustmentHeader>
        <AddAdjustInventory />
      </AdjustmentHeader>
      <PageSubHeader>
        <TransactionsFilter />
      </PageSubHeader>
      <AdjustTable />
    </AccountingLayout>
  );
};
