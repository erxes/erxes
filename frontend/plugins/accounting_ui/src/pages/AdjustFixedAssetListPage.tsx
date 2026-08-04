import { AddAdjustFixedAsset } from '@/adjustments/fxa/components/AdjustFixedAssetForm';
import { AdjustFixedAssetTable } from '@/adjustments/fxa/components/AdjustFixedAssetTable';
import { AdjustmentHeader } from '@/adjustments/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';

export const AdjustFixedAssetListPage = () => {
  return (
    <AccountingLayout>
      <AdjustmentHeader defaultKind="fxa">
        <div className="px-3">
          <AddAdjustFixedAsset />
        </div>
      </AdjustmentHeader>
      <AdjustFixedAssetTable />
    </AccountingLayout>
  );
};
