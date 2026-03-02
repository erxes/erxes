import { RecordTable } from 'erxes-ui';
import { useTemplates } from '../hooks/useTemplates';
import { templateColumns } from './TemplatesColumns';
import { TemplatesCommandBar } from './TemplatesCommandBar';

export const TemplatesRecordTable = () => {
  const { templates, pageInfo, loading, handleFetchMore } = useTemplates();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={templateColumns}
      data={templates || []}
      stickyColumns={['more', 'checkbox', 'avatar', 'name']}
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
