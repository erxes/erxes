import { TicketFields } from '@/ticket/components/ticket-detail/TicketFields';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { Spinner } from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const TicketDetails = ({ ticketId }: { ticketId: string }) => {
  const { t } = useTranslation('frontline');
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
        {t('ticket-not-found')}
      </div>
    );
  }
  return <TicketFields ticket={ticket} />;
};
