import { GET_TICKETS } from '@/ticket/graphql/queries/getTickets';
import { useRemoveTicketsFromView } from '@/ticket/hooks/useRemoveTicketsFromView';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { useQueryState, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useToggleTicketArchive = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { updateTicket } = useUpdateTicket();
  const { removeTicketsFromView } = useRemoveTicketsFromView();
  const [stateFilter] = useQueryState<string>('state');

  const toggleArchive = async (
    ticketIds: string[],
    archived: boolean,
    options?: { onError?: () => void },
  ) => {
    const nextState = archived ? 'active' : 'archived';
    let failedMessage = '';

    await Promise.all(
      ticketIds.map((ticketId) =>
        updateTicket({
          variables: {
            _id: ticketId,
            state: nextState,
          },
          refetchQueries: [GET_TICKETS],
          onError: (error) => {
            failedMessage = failedMessage || error.message;
          },
        }),
      ),
    );

    if (failedMessage) {
      options?.onError?.();
      toast({
        title: t('error'),
        description: failedMessage,
        variant: 'destructive',
      });
      return;
    }

    if (nextState !== (stateFilter || 'active')) {
      removeTicketsFromView(ticketIds);
    }

    toast({
      title: t('success'),
      variant: 'success',
      description: archived
        ? t('ticket-restored-successfully')
        : t('ticket-archived-successfully'),
    });
  };

  return { toggleArchive };
};
