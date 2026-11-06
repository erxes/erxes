import { TICKET_PROPERTY_CONTENT_TYPE } from '@/ticket/constants/createLayout';
import { useCallback } from 'react';
import { IOpenRecordOptions, useSidePanel } from 'ui-modules';

export const useTicketDetailSheet = () => {
  const { record, openRecord, back, canGoBack, close } = useSidePanel();
  const activeTicket =
    record?.contentType === TICKET_PROPERTY_CONTENT_TYPE
      ? record.contentId
      : null;

  const setActiveTicket = useCallback(
    (ticketId: string | null, options?: IOpenRecordOptions) => {
      if (ticketId) {
        openRecord(
          { contentType: TICKET_PROPERTY_CONTENT_TYPE, contentId: ticketId },
          options,
        );
      } else if (activeTicket) {
        if (canGoBack) {
          back();
        } else {
          close();
        }
      }
    },
    [activeTicket, openRecord, back, canGoBack, close],
  );

  return [activeTicket, setActiveTicket] as const;
};
