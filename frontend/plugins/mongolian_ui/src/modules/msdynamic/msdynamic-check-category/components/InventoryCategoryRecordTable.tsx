import { Button, RecordTable } from 'erxes-ui';

import { useMSDynamicSessionKey } from '../../hooks/useMSDynamicSessionKey';
import { useCheckCategory } from '../hooks/useCheckCategory';
import { getInventoryCategoryColumns } from './InventoryCategoryColumns';
import { CategoryFilterType } from '../types/inventoryCategory';
import { InventoryCategoryAction } from '../types/inventoryCategory';

const categoryActions: Record<CategoryFilterType, InventoryCategoryAction> = {
  create: 'CREATE',
  update: 'UPDATE',
  delete: 'DELETE',
};

export const InventoryCategoryRecordTable = () => {
  const { items, loading, selectedFilter, toSyncCategory } = useCheckCategory();
  const { sessionKey } = useMSDynamicSessionKey('categories');
  const action = categoryActions[selectedFilter];
  const data = items?.[selectedFilter]?.items || [];
  const hasAnyData = Object.values(items).some(
    (group) => (group?.items?.length || 0) > 0,
  );

  return (
    <RecordTable.Provider
      columns={getInventoryCategoryColumns(action)}
      data={data.slice(0, 100)}
      className="m-3"
      stickyColumns={['more', 'code']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={false}
        hasNextPage={false}
        dataLength={data.length}
        sessionKey={sessionKey}
      >
        {data.length > 0 && (
          <div className="flex justify-end mb-3">
            <Button size="sm" disabled={loading} onClick={toSyncCategory}>
              Sync
            </Button>
          </div>
        )}

        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={10} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>

        {!loading && !hasAnyData && (
          <div className="m-3 text-center text-muted-foreground">
            No data found
          </div>
        )}
        {loading && !hasAnyData && (
          <div className="m-3 text-center text-muted-foreground">
            Checking...
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
