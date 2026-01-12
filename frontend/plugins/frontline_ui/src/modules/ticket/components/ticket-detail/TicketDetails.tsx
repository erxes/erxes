import { TicketFields } from '@/ticket/components/ticket-detail/TicketFields';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { Spinner, useQueryState } from 'erxes-ui';
import { TicketSideWidgets } from '~/widgets/relations/TicketSideWidgets';
import { useLocation } from 'react-router-dom';

export const TicketDetails = ({ ticketId }: { ticketId: string }) => {
  const location = useLocation();
  const isInInbox = location.pathname.includes('my-inbox');
  const { ticket, loading } = useGetTicket({
    variables: { _id: ticketId },
    fetchPolicy: isInInbox ? 'network-only' : 'cache-first',
  });
  if (loading) {
    return <Spinner />;
  }
  if (!ticket) {
    return (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
        Ticket not found.
      </div>
    );
  }
  return (
    <div className="h-full w-full flex overflow-auto">
      <div className="w-full xl:max-w-3xl mx-auto py-12 px-6">
        <TicketFields ticket={ticket} />
      </div>
      <TicketSideWidgets contentId={ticket._id} />
    </div>
  );
};
