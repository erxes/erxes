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
  return (
    <div className="h-full w-full flex overflow-auto">
      <div className="w-full xl:max-w-3xl mx-auto py-12 px-6">
        {ticket && <TicketFields ticket={ticket} />}
      </div>
      {ticket && <TicketSideWidgets contentId={ticket._id} />}
    </div>
  );
};
