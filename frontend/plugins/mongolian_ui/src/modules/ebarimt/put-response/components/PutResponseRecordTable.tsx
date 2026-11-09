import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { MONGOLIAN_PUT_RESPONSE_TIMEZONE } from '~/modules/ebarimt/put-response/graphql/queries/PutResponseQueries';
import { RecordTable } from 'erxes-ui';
import { putResponseColumns } from '~/modules/ebarimt/put-response/components/PutResponseColumn';
import { PUT_RESPONSE_CURSOR_SESSION_KEY } from '~/modules/ebarimt/put-response/constants/putResponseCursorSessionKey';
import { usePutResponse } from '~/modules/ebarimt/put-response/hooks/usePutResponse';
import { IconShoppingCartX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const PutResponseRecordTable = () => {
  const { data: timezoneData, loading: timezoneLoading } = useQuery<{
    timeZone?: { value?: unknown } | null;
  }>(MONGOLIAN_PUT_RESPONSE_TIMEZONE);
  const configuredTimeZone = timezoneData?.timeZone?.value;
  const timeZone =
    typeof configuredTimeZone === 'string' && configuredTimeZone.trim()
      ? configuredTimeZone
      : 'UTC';
  const columns = useMemo(() => putResponseColumns(timeZone), [timeZone]);
  const { t } = useTranslation('mongolian');
  const { putResponses, handleFetchMore, loading, pageInfo } = usePutResponse();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={columns}
      data={putResponses || []}
      className="m-3"
      stickyColumns={['more', 'name']}
      tableId="mongolian_ebarimt_put_response_record_table"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        loading={loading || timezoneLoading}
        dataLength={putResponses?.length}
        sessionKey={PUT_RESPONSE_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {(timezoneLoading || (loading && !putResponses.length)) && (
              <RecordTable.RowSkeleton rows={30} />
            )}
            {!timezoneLoading && <RecordTable.RowList />}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        {!loading && !timezoneLoading && !putResponses?.length && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX
                  size={48}
                  className="text-muted-foreground"
                />
              </div>
              <h3 className="text-lg font-semibold">{t('no-put-response')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('create-first-put-response')}
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
