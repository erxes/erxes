import { TicketFields } from '@/ticket/components/ticket-detail/TicketFields';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';

export const TicketDetails = ({ ticketId }: { ticketId: string }) => {
  const { ticket } = useGetTicket({
    variables: { _id: ticketId },
  });

  if (!ticket) {
    return null;
  }

  return (
    <div className="h-full w-full flex overflow-auto">
      <div className="w-full xl:max-w-3xl mx-auto py-12 px-6">
        <TicketFields ticket={ticket} />
      </div>
    </div>
  );
};
