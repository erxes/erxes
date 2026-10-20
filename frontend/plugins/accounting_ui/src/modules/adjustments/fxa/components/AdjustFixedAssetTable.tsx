import { useTranslation } from 'react-i18next';
import { IconAdjustmentsOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { useAdjustFixedAssets } from '../hooks/useAdjustFixedAssets';
import { adjustFixedAssetTableColumns } from './AdjustFixedAssetTableColumns';

export const AdjustFixedAssetTable = () => {
  const { t } = useTranslation('accounting');
  const { adjustFixedAssets, loading, error, totalCount, handleFetchMore } =
    useAdjustFixedAssets();

  if (!loading && !adjustFixedAssets?.length) {
    return <AccountingEmptyState error={error} icon={IconAdjustmentsOff} />;
  }

  return (
    <RecordTable.Provider
      columns={adjustFixedAssetTableColumns(t)}
      data={adjustFixedAssets}
      stickyColumns={[]}
      className="m-3"
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
    </RecordTable.Provider>
  );
};
