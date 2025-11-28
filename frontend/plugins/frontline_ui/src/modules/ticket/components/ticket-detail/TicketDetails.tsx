import { TicketFields } from '@/ticket/components/ticket-detail/TicketFields';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { Spinner } from 'erxes-ui';
import { TicketSideWidgets } from '~/widgets/relations/TicketSideWidgets';

export const TicketDetails = ({ ticketId }: { ticketId: string }) => {
  const { ticket, loading } = useGetTicket({
    variables: { _id: ticketId },
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
