import { useTicketsColumns } from '@/ticket/components/TicketsColumn';
import { isUndefinedOrNull, RecordTable, useQueryState } from 'erxes-ui';
import { useTickets } from '@/ticket/hooks/useGetTickets';
import { TICKETS_CURSOR_SESSION_KEY } from '@/ticket/constants';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { ticketTotalCountAtom } from '@/ticket/states/ticketsTotalCountState';
import { TicketPipelineFallback } from '@/ticket/components/TicketPipelineFallback';
import { TicketCommandBar } from './ticket-command-bar/TicketCommandbar';

const TicketsTableBody = ({
  handleFetchMore,
  loading,
}: {
  handleFetchMore: ReturnType<typeof useTickets>['handleFetchMore'];
  loading: boolean;
}) => (
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
      skip: !pipelineId,
    });

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const columns = useTicketsColumns();

  useEffect(() => {
    if (isUndefinedOrNull(totalCount)) return;
    setTicketTotalCount(totalCount);
  }, [totalCount, setTicketTotalCount]);

  if (!pipelineId) {
    return <TicketPipelineFallback />;
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
      <RecordTable.Provider
        columns={columns}
        data={tickets || []}
        className="m-3 flex-1"
        stickyColumns={['more', 'checkbox', 'name']}
      >
        <RecordTable.CursorProvider
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          dataLength={tickets?.length}
          sessionKey={TICKETS_CURSOR_SESSION_KEY}
        >
          <TicketsTableBody
            handleFetchMore={handleFetchMore}
            loading={loading}
          />
        </RecordTable.CursorProvider>
        <TicketCommandBar />
      </RecordTable.Provider>
    </div>
  );
};
