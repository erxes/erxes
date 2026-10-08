import { IconArchive } from '@tabler/icons-react';
import { useMemo } from 'react';
import { RecordTable } from 'erxes-ui';

import { LOGS_CURSOR_SESSION_KEY } from '../constants/logFilter';
import { useLogs } from '../hooks/useLogs';
import { logColumns } from './LogColumns';
import { LogDetailSheet } from '@/logs/components/LogDetailSheet';
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
        {!totalCount && !loading && (
          <div className="absolute inset-0">
            <div className="flex h-full w-full justify-center px-8">
              <div className="flex h-full min-h-[360px] flex-col items-center justify-center text-center">
                <IconArchive
                  size={64}
                  className="mx-auto mb-4 text-muted-foreground"
                />

                <h3 className="mb-2 text-xl font-semibold">
                  {t('no-results-found')}
                </h3>

                <p className="max-w-md text-muted-foreground">
                  {t('no-results-description')}
                </p>
              </div>
            </div>
          </div>
        )}
        <LogDetailSheet />
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
