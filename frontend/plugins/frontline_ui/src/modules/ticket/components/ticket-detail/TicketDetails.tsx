import { TicketFields } from '@/ticket/components/ticket-detail/TicketFields';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { Spinner } from 'erxes-ui';
export const TicketDetails = ({ ticketId }: { ticketId: string }) => {
  const { ticket, loading } = useGetTicket({
    variables: { _id: ticketId },
  });

  return (
    <div className="h-full w-full flex overflow-auto">
      <div className="w-full xl:max-w-3xl mx-auto py-12 px-6">
        {loading ? <Spinner /> : ticket && <TicketFields ticket={ticket} />}
      </div>
    </div>
  );
};
