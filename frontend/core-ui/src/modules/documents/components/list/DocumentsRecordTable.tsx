import { useDocuments } from '@/documents/hooks/useDocuments';
import { IconFileOff } from '@tabler/icons-react';
import { Empty, RecordTable } from 'erxes-ui';

import { DocumentsColumn } from './DocumentsColumn';

function DocumentsEmptyState() {
  return (
    <Empty className="h-full border-0 bg-transparent">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconFileOff />
        </Empty.Media>
        <Empty.Title>No documents found</Empty.Title>
        <Empty.Description>
          There are no documents to display.
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
}

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

export function DocumentsRecordTable() {
  const columns = DocumentsColumn();
  const { documents, loading, handleFetchMore, pageInfo } = useDocuments();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (!loading && documents.length === 0) {
    return <DocumentsEmptyState />;
  }

  return (
    <div className="flex flex-col overflow-hidden h-full relative">
      <RecordTable.Provider
        columns={columns}
        data={documents}
        className="m-3 h-full"
        stickyColumns={['more', 'checkbox', 'name']}
        tableId="documents_record_table"
      >
        <RecordTable.CursorProvider
          dataLength={documents.length}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
        >
          <DocumentsTable handleFetchMore={handleFetchMore} loading={loading} />
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </div>
  );
}
