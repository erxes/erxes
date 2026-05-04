import { RecordTable, Button } from 'erxes-ui';
import { IconShoppingCartX } from '@tabler/icons-react';
import { CHECK_CATEGORY_CURSOR_SESSION_KEY } from '../constants/checkCategoryCursorSessionKey';
import { useCheckCategory } from '../hooks/useCheckCategory';
import { checkCategoryColumns } from './CheckCategoryColumn';

export const CheckCategoryRecordTable = () => {
  const {
    filteredCategories,
    loading,
    pageInfo,
    checkCategory,
    syncCategories,
    syncLoading,
    toCheckCategories,
  } = useCheckCategory();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const handleFetchMore = () => {
    checkCategory();
  };

  return (
    <div className="m-3 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Categories</h2>
        <Button
          onClick={syncCategories}
          disabled={
            syncLoading ||
            !filteredCategories ||
            filteredCategories.length === 0
          }
        >
          {syncLoading ? 'Syncing...' : 'Sync'}
        </Button>
      </div>

      <RecordTable.Provider
        columns={checkCategoryColumns}
        data={filteredCategories || []}
        className="h-full w-full px-2 overflow-y-auto"
        stickyColumns={['more', 'checkbox', 'createdAt']}
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={filteredCategories?.length}
          sessionKey={CHECK_CATEGORY_CURSOR_SESSION_KEY}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.CursorBackwardSkeleton
                handleFetchMore={handleFetchMore}
              />
              {loading && <RecordTable.RowSkeleton rows={40} />}
              <RecordTable.RowList />
              <RecordTable.CursorForwardSkeleton
                handleFetchMore={handleFetchMore}
              />
            </RecordTable.Body>
          </RecordTable>
          {!loading &&
            !toCheckCategories &&
            filteredCategories?.length === 0 && (
              <div className="absolute inset-0">
                <div className="h-full w-full px-8 flex justify-center">
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                    <div className="mb-6">
                      <IconShoppingCartX
                        size={64}
                        className="text-muted-foreground mx-auto mb-4"
                      />
                      <h3 className="text-xl font-semibold mb-2">
                        No category yet
                      </h3>
                      <p className="text-muted-foreground max-w-md">
                        Get started by creating your first category.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </div>
  );
};
