import { IconArchive } from '@tabler/icons-react';
import { RecordTable } from 'erxes-ui';

import { useTranslation } from 'react-i18next';
import { LOGS_CURSOR_SESSION_KEY } from '../constants/logFilter';
import { useLogs } from '../hooks/useLogs';
import { logColumns } from './LogColumns';
import { LogDetailSheet } from '@/logs/components/LogDetailSheet';

export const LogsRecordTable = () => {
  const { t } = useTranslation('common');
  const {
    loading,
    totalCount,
    list,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
  } = useLogs();

  return (
    <RecordTable.Provider
      columns={logColumns(t)}
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
        <RecordTable className="w-full">
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
                  {t('logs.no-results', 'No results found')}
                </h3>

                <p className="max-w-md text-muted-foreground">
                  {t('logs.no-results-description', "We couldn't find anything matching your search. Try adjusting your filters or search query.")}
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
