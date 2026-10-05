import {
  IconAlertTriangle,
  IconArchive,
  IconRefresh,
} from '@tabler/icons-react';
import { Button, Empty, RecordTable, Spinner } from 'erxes-ui';

import { LOGS_CURSOR_SESSION_KEY } from '../constants/logFilter';
import { useLogs } from '../hooks/useLogs';
import { useLogsRefetch } from '../hooks/useLogsRefetch';
import { logColumns } from './LogColumns';
import { LogDetailSheet } from '@/logs/components/LogDetailSheet';

const LogsErrorState = ({ message }: { message: string }) => {
  const { refetching, handleRefetch } = useLogsRefetch();

  return (
    <Empty className="m-3 min-h-[20rem]">
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconAlertTriangle />
        </Empty.Media>
        <Empty.Title>Failed to load logs</Empty.Title>
        <Empty.Description>{message}</Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="outline" disabled={refetching} onClick={handleRefetch}>
          {refetching ? <Spinner size="sm" /> : <IconRefresh />}
          Retry
        </Button>
      </Empty.Content>
    </Empty>
  );
};

const LogsEmptyState = () => (
  <Empty className="m-3 min-h-[20rem]">
    <Empty.Header>
      <Empty.Media variant="icon">
        <IconArchive />
      </Empty.Media>
      <Empty.Title>No results found</Empty.Title>
      <Empty.Description>
        We couldn't find anything matching your search. Try adjusting your
        filters or search query.
      </Empty.Description>
    </Empty.Header>
  </Empty>
);

export const LogsRecordTable = () => {
  const {
    loading,
    error,
    totalCount,
    list,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
  } = useLogs();

  if (error) {
    return <LogsErrorState message={error.message} />;
  }

  if (!loading && !totalCount) {
    return <LogsEmptyState />;
  }

  return (
    <RecordTable.Provider
      columns={logColumns}
      data={list}
      stickyColumns={['detail']}
      className="m-2"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list?.length}
        sessionKey={LOGS_CURSOR_SESSION_KEY}
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
        <LogDetailSheet />
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
