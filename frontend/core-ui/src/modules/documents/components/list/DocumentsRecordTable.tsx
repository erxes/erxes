import { useDocuments } from '@/documents/hooks/useDocuments';
import { RecordTable } from 'erxes-ui';
import { DocumentsEmptyState } from '../DocumentsEmptyState';
import { DocumentsErrorState } from '../DocumentsErrorState';
import { DocumentsColumn } from './DocumentsColumn';
import { DocumentsRecordTableCommandBar } from './DocumentsRecordTableCommandBar';

type DocumentsTableProps = {
  handleFetchMore: ReturnType<typeof useDocuments>['handleFetchMore'];
  loading: boolean;
};

function DocumentsTable({ handleFetchMore, loading }: DocumentsTableProps) {
  return (
    <RecordTable>
      <RecordTable.Header />
      <RecordTable.Body>
        <RecordTable.CursorBackwardSkeleton handleFetchMore={handleFetchMore} />
        {loading && <RecordTable.RowSkeleton rows={40} />}
        <RecordTable.RowList />
        <RecordTable.CursorForwardSkeleton handleFetchMore={handleFetchMore} />
      </RecordTable.Body>
    </RecordTable>
  );
}

type DocumentsRecordTableProps = {
  hasFilters: boolean;
  onClearFilters: () => void;
};

export function DocumentsRecordTable({
  hasFilters,
  onClearFilters,
}: DocumentsRecordTableProps) {
  const columns = DocumentsColumn();
  const { documents, hasError, loading, handleFetchMore, pageInfo, refetch } =
    useDocuments();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (hasError) {
    return <DocumentsErrorState onRetry={refetch} />;
  }

  if (!loading && documents.length === 0) {
    return (
      <DocumentsEmptyState
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="flex flex-col overflow-hidden h-full relative">
      <RecordTable.Provider
        columns={columns}
        data={documents}
        className="m-3 h-full"
        stickyColumns={['more', 'checkbox', 'name']}
        tableId="documents_record_table_v2"
      >
        <RecordTable.CursorProvider
          dataLength={documents.length}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
        >
          <DocumentsTable handleFetchMore={handleFetchMore} loading={loading} />
        </RecordTable.CursorProvider>
        <DocumentsRecordTableCommandBar />
      </RecordTable.Provider>
    </div>
  );
}
