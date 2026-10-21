import { useTranslation } from 'react-i18next';
import { IconAdjustmentsOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { AddAdjustFixedAsset } from '@/adjustments/fxa/components/AdjustFixedAssetForm';
import { useAdjustFixedAssets } from '@/adjustments/fxa/hooks/useAdjustFixedAssets';
import { adjustFixedAssetTableColumns } from '@/adjustments/fxa/components/AdjustFixedAssetTableColumns';

export const AdjustFixedAssetTable = () => {
  const { t } = useTranslation('accounting');
  const { adjustFixedAssets, loading, error, totalCount, handleFetchMore } =
    useAdjustFixedAssets();

  const isEmpty = !loading && !adjustFixedAssets?.length;

  return (
    <RecordTable.Provider
      columns={adjustFixedAssetTableColumns(t)}
      data={adjustFixedAssets}
      stickyColumns={[]}
      className="relative m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {!loading && totalCount > adjustFixedAssets.length && (
              <RecordTable.RowSkeleton
                rows={4}
                handleInView={handleFetchMore}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      {isEmpty && (
        <AccountingEmptyState
          overlay
          error={error}
          icon={IconAdjustmentsOff}
          description={t('empty-list-description')}
          action={<AddAdjustFixedAsset />}
        />
      )}
    </RecordTable.Provider>
  );
};
