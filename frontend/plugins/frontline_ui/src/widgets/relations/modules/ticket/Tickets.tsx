import { useConversationDetail } from '@/inbox/conversations/conversation-detail/hooks/useConversationDetail';
import { AddTicketSheet } from '@/ticket/components/add-ticket/AddTicketSheet';
import { ticketCreateDefaultValuesState } from '@/ticket/states/ticketCreateSheetState';
import { GET_TICKETS } from '@/ticket/graphql/queries/getTickets';
import { useQuery } from '@apollo/client';
import { IconTicketOff } from '@tabler/icons-react';
import { Spinner, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getHostContacts,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
  RelationWidgetList,
} from 'ui-modules';
import { TicketWidget } from './TicketWidget';

// The most tickets listed for one customer or company.
const CONTACT_RECORDS_LIMIT = 50;

/**
 * The tickets of the host's customer and company, found by the contact on
 * the tickets themselves; "+" creates one for them (createTicket saves the
 * contact).
 */
export const TicketRelationWidget = ({
  contentId,
  contentType,
  customerId,
  companyId,
  customerIds,
  companyIds,
}: IRelationWidgetProps) => {
  const { t } = useTranslation('frontline');
  const contacts = getHostContacts({
    contentType,
    contentId,
    customerId,
    companyId,
    customerIds,
    companyIds,
  });
  const customerTickets = useQuery(GET_TICKETS, {
    variables: {
      filter: { customerId: contacts.customerId, limit: CONTACT_RECORDS_LIMIT },
    },
    skip: !contacts.customerId,
  });
  const companyTickets = useQuery(GET_TICKETS, {
    variables: {
      filter: { companyId: contacts.companyId, limit: CONTACT_RECORDS_LIMIT },
    },
    skip: !contacts.companyId,
  });

  const setTicketCreateDefaultValues = useSetAtom(
    ticketCreateDefaultValuesState,
  );
  const [conversationId] = useQueryState<string | null>('conversationId');

  const { conversationDetail } = useConversationDetail({
    variables: {
      _id: conversationId || '',
    },
    skip: !conversationId,
  });

  useEffect(() => {
    if (!conversationDetail?.integration?.channelId) return;
    setTicketCreateDefaultValues({
      channelId: conversationDetail?.integration.channelId || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationDetail]);

  if (customerTickets.loading || companyTickets.loading) {
    return <Spinner containerClassName="py-20" />;
  }

  // The host itself is not listed among its contacts' tickets.
  const ticketIds = [
    ...new Set(
      [
        ...(customerTickets.data?.getTickets?.list || []),
        ...(companyTickets.data?.getTickets?.list || []),
      ].flatMap((ticket) =>
        ticket && ticket._id !== contentId ? [ticket._id] : [],
      ),
    ),
  ];

  if (ticketIds.length === 0) {
    return (
      <RelationWidgetEmptyState
        icon={IconTicketOff}
        message={t(
          'no-tickets-to-display',
          'No tickets to display at the moment.',
        )}
      >
        <AddTicketSheet
          contacts={contacts}
          variant="secondary"
          isRelation={true}
        />
      </RelationWidgetEmptyState>
    );
  }

  return (
    <RelationWidgetList
      label={t('tickets', 'Tickets')}
      actions={
        <AddTicketSheet
          contacts={contacts}
          variant="secondary"
          isRelation={true}
        />
      }
    >
      {ticketIds.map((ticketId) => (
        <TicketWidget key={ticketId} ticketId={ticketId} />
      ))}
    </RelationWidgetList>
  );
};
