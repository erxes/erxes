import { useTranslation } from 'react-i18next';
import { useAdjustInventories } from '../hooks/useAdjustInventories';
import { adjustTableColumns } from './AdjustTableColumns';
import { IconAdjustmentsOff } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';

export const AdjustTable = () => {
  const { t } = useTranslation('accounting');
  const { adjustInventories, loading, error, totalCount, handleFetchMore } =
    useAdjustInventories();

  if (!loading && !adjustInventories?.length) {
    return <AccountingEmptyState error={error} icon={IconAdjustmentsOff} />;
  }

  return (
    <RecordTable.Provider
      columns={adjustTableColumns(t)}
      data={adjustInventories || []}
      stickyColumns={[]}
      className="m-3"
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
    </RecordTable.Provider>
  );
};
