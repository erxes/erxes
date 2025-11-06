import { TicketWidgetCard } from '~/widgets/relations/modules/ticket/TicketWidgetCard';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';

export const TicketWidget = ({ ticketId }: { ticketId: string }) => {
  const { ticket } = useGetTicket({ variables: { _id: ticketId } });
  if (ticket) {
    return <TicketWidgetCard ticket={ticket || {}} />;
  }
};
