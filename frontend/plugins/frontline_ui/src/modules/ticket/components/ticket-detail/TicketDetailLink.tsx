import { TICKETS_DETAIL_QUERY_KEY } from '@/ticket/constants';
import { TICKET_PROPERTY_CONTENT_TYPE } from '@/ticket/constants/createLayout';
import { useMultiQueryState } from 'erxes-ui';
import { useEffect } from 'react';
import { getSidePanelRecordPath } from 'ui-modules';

export const TicketDetailLink = () => {
  const [queries, setQueries] = useMultiQueryState<Record<string, string>>([
    TICKETS_DETAIL_QUERY_KEY,
    'panel',
  ]);
  const linkedTicket = queries[TICKETS_DETAIL_QUERY_KEY];

  useEffect(() => {
    if (!linkedTicket) return;

    setQueries({
      [TICKETS_DETAIL_QUERY_KEY]: null,
      panel: getSidePanelRecordPath({
        contentType: TICKET_PROPERTY_CONTENT_TYPE,
        contentId: linkedTicket,
      }),
    });
  }, [linkedTicket, setQueries]);

  return null;
};
