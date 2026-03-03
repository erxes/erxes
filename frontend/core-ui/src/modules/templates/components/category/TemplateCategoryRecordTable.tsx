import { TemplatesCommandBar } from '@/templates/components/TemplatesCommandBar';
import { useTemplateCategories } from '@/templates/hooks/useTemplateCategories';
import { RecordTable } from 'erxes-ui';
import { templateCategoryColumns } from './TemplateCategoryColumns';

export const TemplateCategoryRecordTable = () => {
  const { categories, pageInfo, loading, handleFetchMore } =
    useTemplateCategories({});

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={templateCategoryColumns}
      data={categories || []}
      stickyColumns={['more', 'checkbox', 'name']}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={categories?.length}
        sessionKey={'template-category-cursor'}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}

            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      <TemplatesCommandBar />
    </RecordTable.Provider>
  );
};
