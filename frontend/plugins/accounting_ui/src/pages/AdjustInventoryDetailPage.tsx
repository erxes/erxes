import { AccountingLayout } from '@/layout/components/Layout';
import { AccountingHeader } from '@/layout/components/Header';
import { AdjustInventoryDetail } from '@/adjustments/inventories/components/AdjustInventoryDetail';

export const AdjustInventoryDetailPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink='/accounting/adjustment/inventory'
        returnText='Inventory'
      >
      </AccountingHeader>
      <AdjustInventoryDetail />
    </AccountingLayout>
  );
};
