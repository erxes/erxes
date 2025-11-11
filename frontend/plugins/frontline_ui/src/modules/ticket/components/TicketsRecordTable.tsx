import { ticketsColumns } from '@/ticket/components/TicketsColumn';
import { isUndefinedOrNull, RecordTable, useQueryState } from 'erxes-ui';
import { useTickets } from '@/ticket/hooks/useGetTickets';
import { TICKETS_CURSOR_SESSION_KEY } from '@/ticket/constants';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { ticketTotalCountAtom } from '@/ticket/states/ticketsTotalCountState';

export const TicketsRecordTable = () => {
  const setTicketTotalCount = useSetAtom(ticketTotalCountAtom);
  const [pipelineId] = useQueryState<string | null>('pipelineId');
  const [channelId] = useQueryState<string | null>('channelId');

  const variables = {
    pipelineId,
    channelId,
  };

  const { tickets, handleFetchMore, pageInfo, loading, totalCount } =
    useTickets({
      variables,
    });

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  useEffect(() => {
    if (isUndefinedOrNull(totalCount)) return;
    setTicketTotalCount(totalCount);
  }, [totalCount, setTicketTotalCount]);

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <RecordTable.Provider
        columns={ticketsColumns()}
        data={tickets || (loading ? [{}] : [])}
        className="m-3 h-full"
        stickyColumns={['checkbox', 'name']}
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={tickets?.length}
          sessionKey={TICKETS_CURSOR_SESSION_KEY}
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
        </RecordTable.CursorProvider>
      </RecordTable.Provider>
    </div>
  );
};
