import { TICKET_PROPERTY_CONTENT_TYPE } from '@/ticket/constants/createLayout';
import { useCallback } from 'react';
import { IOpenRecordOptions, useSidePanel } from 'ui-modules';

export const useTicketDetailSheet = () => {
  const { record, openRecord, close } = useSidePanel();
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
        close();
      }
    },
    [activeTicket, openRecord, close],
  );

  return [activeTicket, setActiveTicket] as const;
};
