import { useTicketsColumns } from '@/ticket/components/TicketsColumn';
import { Empty, isUndefinedOrNull, RecordTable, useQueryState } from 'erxes-ui';
import { useTickets } from '@/ticket/hooks/useGetTickets';
import { TICKETS_CURSOR_SESSION_KEY } from '@/ticket/constants';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { ticketTotalCountAtom } from '@/ticket/states/ticketsTotalCountState';
import { TicketPipelineFallback } from '@/ticket/components/TicketPipelineFallback';
import { TicketCommandBar } from '@/ticket/components/ticket-command-bar/TicketCommandbar';
import { IconTicket } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
export const TicketsRecordTable = () => {
  const { t } = useTranslation('frontline');
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

  useEffect(() => {
    if (isUndefinedOrNull(totalCount)) return;
    setTicketTotalCount(totalCount);
  }, [totalCount, setTicketTotalCount]);

  return (
    <div className="flex flex-col overflow-hidden h-full relative">
      {!loading && !pipelineId && (
        <TicketPipelineFallback className="absolute inset-0" />
      )}
      <RecordTable.Provider
        columns={useTicketsColumns()}
        data={tickets || (loading ? [{}] : [])}
        className="m-3 h-full"
        stickyColumns={['more', 'checkbox', 'name']}
        tableId="frontline_tickets_record_table"
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
        <TicketCommandBar />
      </RecordTable.Provider>
      {!loading && pipelineId && tickets?.length === 0 && (
        <Empty className="absolute inset-x-3 top-12 bottom-3 z-10 rounded-lg bg-background">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconTicket />
            </Empty.Media>
            <Empty.Title>{t('no-tickets-found')}</Empty.Title>
          </Empty.Header>
        </Empty>
      )}
    </div>
  );
};
