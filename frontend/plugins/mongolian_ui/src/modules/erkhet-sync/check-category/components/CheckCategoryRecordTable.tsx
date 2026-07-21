import { RecordTable, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IconShoppingCartX } from '@tabler/icons-react';
import { CHECK_CATEGORY_CURSOR_SESSION_KEY } from '../constants/checkCategoryCursorSessionKey';
import { useCheckCategory } from '../hooks/useCheckCategory';
import { checkCategoryColumns } from './CheckCategoryColumn';
import { CheckCategoryCommandBar } from './CheckCategoryCommandBar';

export const CheckCategoryRecordTable = () => {
  const { t } = useTranslation('mongolian');
  const {
    filteredCategories,
    loading,
    pageInfo,
    checkCategory,
    toCheckCategories,
  } = useCheckCategory();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const isInitialLoading = loading && toCheckCategories === null;

  return (
    <RecordTable.Provider
      columns={checkCategoryColumns}
      data={filteredCategories || []}
      className="m-3"
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
              handleFetchMore={checkCategory}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={checkCategory}
            />
          </RecordTable.Body>
        </RecordTable>
        {isInitialLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
        {!loading &&
          !toCheckCategories?.length &&
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
                      {t('no-category-yet', 'No category yet')}
                    </h3>
                    <p className="text-muted-foreground max-w-md">
                      {t('create-first-category', 'Get started by creating your first category.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
      </RecordTable.CursorProvider>
      <CheckCategoryCommandBar />
    </RecordTable.Provider>
  );
};
