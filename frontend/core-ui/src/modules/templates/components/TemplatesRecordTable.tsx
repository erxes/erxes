import { templateColumns } from '@/templates/components/TemplatesColumns';
import { TemplatesCommandBar } from '@/templates/components/TemplatesCommandBar';
import { useTemplates } from '@/templates/hooks/useTemplates';
import { RecordTable } from 'erxes-ui';

export const TemplatesRecordTable = () => {
  const { templates, pageInfo, loading, handleFetchMore } = useTemplates();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={templateColumns}
      data={templates || []}
      stickyColumns={['more', 'checkbox', 'name']}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={templates?.length}
        sessionKey={'template-cursor'}
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
