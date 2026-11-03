import { AddTicketSheet } from '@/ticket/components/add-ticket/AddTicketSheet';
import { GET_TICKETS } from '@/ticket/graphql/queries/getTickets';
import { useTicketDetailSheet } from '@/ticket/hooks/useTicketDetailSheet';
import { ticketCreateSheetState } from '@/ticket/states/ticketCreateSheetState';
import { useQuery } from '@apollo/client';
import { IconTicket } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ContactWidgetRow,
  ContactWidgetSection,
  IContactWidgetProps,
} from 'ui-modules';

const TicketDetailSheet = lazy(() =>
  import('@/ticket/components/ticket-detail/TicketDetailSheet').then(
    (module) => ({ default: module.TicketDetailSheet }),
  ),
);

// The most tickets listed for one contact.
const CONTACT_RECORDS_LIMIT = 50;

const TicketContactRow = ({
  ticket,
}: {
  ticket: { _id: string; name?: string | null; number?: string | null };
}) => {
  const { t } = useTranslation('frontline');
  const [, setActiveTicket] = useTicketDetailSheet();

  return (
    <ContactWidgetRow
      title={ticket.name || t('untitled', 'Untitled')}
      meta={ticket.number ? `#${ticket.number}` : undefined}
      onClick={() => setActiveTicket(ticket._id)}
    />
  );
};

// A customer's or company's tickets, found by the contact on the tickets
// themselves; "+" creates one for them (createTicket saves the contact).
export const TicketsContactSection = ({
  contentType,
  contentId,
}: Omit<IContactWidgetProps, 'module'>) => {
  const { t } = useTranslation('frontline');
  const contacts =
    contentType === 'core:company'
      ? { companyId: contentId }
      : { customerId: contentId };
  const { data, loading } = useQuery(GET_TICKETS, {
    variables: { filter: { ...contacts, limit: CONTACT_RECORDS_LIMIT } },
  });
  const tickets = (data?.getTickets?.list || []).flatMap((ticket) =>
    ticket ? [ticket] : [],
  );
  const ticketsById = new Map(tickets.map((ticket) => [ticket._id, ticket]));
  const setOpenCreateTicket = useSetAtom(ticketCreateSheetState);
  const [activeTicket] = useTicketDetailSheet();

  return (
    <ContactWidgetSection
      icon={IconTicket}
      label={t('tickets', 'Tickets')}
      ids={[...ticketsById.keys()]}
      loading={loading}
      createLabel={t('add-ticket', 'Add ticket')}
      onCreate={() => setOpenCreateTicket(true)}
      renderItem={(ticketId) => {
        const ticket = ticketsById.get(ticketId);

        return ticket && <TicketContactRow ticket={ticket} />;
      }}
    >
      <AddTicketSheet contacts={contacts} isRelation hideTrigger />
      <Suspense>
        {activeTicket && ticketsById.has(activeTicket) && (
          <TicketDetailSheet hideRelationWidgetSideTabs />
        )}
      </Suspense>
    </ContactWidgetSection>
  );
};
