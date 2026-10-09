import { IconArchiveOff } from '@tabler/icons-react';
import { useMemo } from 'react';
import { RecordTable } from 'erxes-ui';

import { LOGS_CURSOR_SESSION_KEY } from '../constants/logFilter';
import { useLogs } from '../hooks/useLogs';
import { logColumns } from './LogColumns';
import { LogDetailSheet } from '@/logs/components/LogDetailSheet';
import { EmptyState } from '@/settings/components/EmptyState';
import { useTranslation } from 'react-i18next';

export const LogsRecordTable = () => {
  const { t } = useTranslation('common', { keyPrefix: 'logs' });
  const {
    loading,
    totalCount,
    list,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
  } = useLogs();
  const columns = useMemo(() => logColumns(t), [t]);

  const { t: tSystemLogs } = useTranslation('settings', {
    keyPrefix: 'system-logs',
  });

  const isEmpty = !loading && !totalCount;

  return (
    <RecordTable.Provider
      columns={columns}
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
        {isEmpty && (
          <EmptyState
            icon={IconArchiveOff}
            title={tSystemLogs('no-system-logs-found')}
            description={tSystemLogs('system-logs-description')}
          />
        )}
        <LogDetailSheet />
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
