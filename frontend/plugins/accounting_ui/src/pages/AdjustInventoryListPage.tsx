import { AdjustTable } from '@/adjustments/inventories/components/AdjustTable';
import { AccountingLayout } from '@/layout/components/Layout';
import { TransactionsFilterBar } from '@/transactions/components/TrListFilterBar';
import { TransactionsFilter } from '@/transactions/components/TrFilters';
import { AdjustmentHeader } from '../modules/adjustments/components/Header';
import { AddAdjustInventory } from '@/adjustments/inventories/components/AdjustInventoryForm';

export const AdjustInventoryListPage = () => {
  return (
    <AccountingLayout>
      <AdjustmentHeader>
        <div className="px-3">
          <TransactionsFilter />
          <AddAdjustInventory />

        </div>
      </AdjustmentHeader>
      <TransactionsFilterBar />
      <AdjustTable />
    </AccountingLayout>
  );
};
