import { TicketWidgetCard } from '~/widgets/relations/modules/ticket/TicketWidgetCard';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { Spinner } from 'erxes-ui';

export const TicketWidget = ({ ticketId }: { ticketId: string }) => {
  const { ticket, loading } = useGetTicket({ variables: { _id: ticketId } });

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner size="sm" />
      </div>
    );
  }

  if (!ticket) {
    return null;
  }

  return <TicketWidgetCard ticket={ticket} />;
};
