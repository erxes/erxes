import { TicketFields } from '@/ticket/components/ticket-detail/TicketFields';
import { useGetTicket } from '@/ticket/hooks/useGetTicket';
import { Empty, Spinner } from 'erxes-ui';
import { IconInfoCircle } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const TicketDetails = ({ ticketId }: { ticketId: string }) => {
  const { t } = useTranslation('frontline');
  const location = useLocation();
  const isInInbox = location.pathname.includes('my-inbox');
  const { ticket, loading, error } = useGetTicket({
    variables: { _id: ticketId },
    fetchPolicy: isInInbox ? 'network-only' : 'cache-first',
  });
  if (loading) {
    return <Spinner />;
  }
  if (!ticket) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6">
        <Empty>
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconInfoCircle />
            </Empty.Media>
            <Empty.Title>
              {t('ticket-not-found', 'Ticket not found')}
            </Empty.Title>
            <Empty.Description>
              {error?.message ||
                t('ticket-no-longer-available', {
                  defaultValue:
                    'This ticket may have been removed or is no longer available.',
                })}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </div>
    );
  }
  return <TicketFields ticket={ticket} />;
};
