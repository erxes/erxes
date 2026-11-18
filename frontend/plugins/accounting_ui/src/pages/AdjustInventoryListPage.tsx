import { AdjustTable } from '@/adjustments/inventories/components/AdjustTable';
import { AccountingLayout } from '@/layout/components/Layout';
import { AdjustmentHeader } from '../modules/adjustments/components/Header';
import { AddAdjustInventory } from '@/adjustments/inventories/components/AdjustInventoryForm';

export const AdjustInventoryListPage = () => {
  return (
    <AccountingLayout>
      <AdjustmentHeader>
        <AddAdjustInventory />
      </AdjustmentHeader>
      <AdjustTable />
    </AccountingLayout>
  );
};
