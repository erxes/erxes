import { useTranslation } from 'react-i18next';
import { useAdjustInventories } from '@/adjustments/inventories/hooks/useAdjustInventories';
import { adjustTableColumns } from '@/adjustments/inventories/components/AdjustTableColumns';
import { IconAdjustmentsOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { AddAdjustInventory } from '@/adjustments/inventories/components/AdjustInventoryForm';

export const AdjustTable = () => {
  const { t } = useTranslation('accounting');
  const { adjustInventories, loading, error, totalCount, handleFetchMore } =
    useAdjustInventories();

  const isEmpty = !loading && !adjustInventories?.length;

  return (
    <RecordTable.Provider
      columns={adjustTableColumns(t)}
      data={adjustInventories || []}
      stickyColumns={[]}
      className="relative m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {!loading && totalCount > adjustInventories?.length && (
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
          action={<AddAdjustInventory />}
        />
      )}
    </RecordTable.Provider>
  );
};
