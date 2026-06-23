import { IconCategory } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';

import { useMSDynamicSessionKey } from '../../hooks/useMSDynamicSessionKey';
import { useCheckCategory } from '../hooks/useCheckCategory';
import { getInventoryCategoryColumns } from './InventoryCategoryColumns';
import { InventoryCategoryCommandBar } from './InventoryCategoryCommandBar';
import {
  CategoryFilterType,
  InventoryCategoryAction,
} from '../types/inventoryCategory';

const categoryActions: Record<CategoryFilterType, InventoryCategoryAction> = {
  create: 'CREATE',
  update: 'UPDATE',
  delete: 'DELETE',
};

export const InventoryCategoryRecordTable = () => {
  const { items, loading, selectedFilter, toCheckCategory, pageInfo } =
    useCheckCategory();
  const { sessionKey } = useMSDynamicSessionKey('categories');
  const { hasPreviousPage, hasNextPage } = pageInfo;
  const action = categoryActions[selectedFilter];
  const data = items?.[selectedFilter]?.items || [];
  const hasAnyData = Object.values(items || {}).some(
    (group) => (group?.items?.length || 0) > 0,
  );

  return (
    <RecordTable.Provider
      columns={getInventoryCategoryColumns(action)}
      data={data}
      className="h-full w-full overflow-y-auto px-2"
      stickyColumns={['checkbox']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={data.length}
        sessionKey={sessionKey}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={toCheckCategory}
            />
            {loading && <RecordTable.RowSkeleton rows={20} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={toCheckCategory}
            />
          </RecordTable.Body>
        </RecordTable>

        {!loading && !hasAnyData && (
          <div className="absolute inset-0">
            <div className="h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[360px] text-center">
                <IconCategory
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  No categories in this group
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Run check or choose another category group.
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <InventoryCategoryCommandBar />
    </RecordTable.Provider>
  );
};
