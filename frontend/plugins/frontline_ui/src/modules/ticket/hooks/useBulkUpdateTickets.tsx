import { GET_TICKETS } from '@/ticket/graphql/queries/getTickets';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { useApolloClient } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export type TBulkTicketUpdate = {
  assigneeId?: string | null;
  assignedMembers?: string[];
  statusId?: string;
  priority?: number;
  tagIds?: string[];
  pipelineId?: string;
  state?: string;
};

export type TBulkUpdateOptions = {
  successMessage: string;
  /** Refetch the ticket list once, after every update settled. */
  refetchList?: boolean;
  /** Called before the error toast so callers can roll back optimistic state. */
  onError?: () => void;
};

export type TUseBulkUpdateTickets = {
  bulkUpdateTickets: (
    ticketIds: string[],
    update: TBulkTicketUpdate,
    options: TBulkUpdateOptions,
  ) => Promise<boolean>;
};

export const useBulkUpdateTickets = (): TUseBulkUpdateTickets => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { updateTicket } = useUpdateTicket();
  const client = useApolloClient();

  const bulkUpdateTickets = async (
    ticketIds: string[],
    update: TBulkTicketUpdate,
    { successMessage, refetchList, onError }: TBulkUpdateOptions,
  ) => {
    let failedMessage = '';

    await Promise.all(
      ticketIds.map((ticketId) =>
        updateTicket({
          variables: {
            _id: ticketId,
            ...update,
          },
          onError: (error) => {
            failedMessage = failedMessage || error.message;
          },
        }),
      ),
    );

    if (failedMessage) {
      onError?.();
      toast({
        title: t('error'),
        description: failedMessage,
        variant: 'destructive',
      });
      return false;
    }

    if (refetchList) {
      await client.refetchQueries({ include: [GET_TICKETS] });
    }

    toast({
      title: t('success'),
      variant: 'success',
      description: successMessage,
    });

    return true;
  };

  return { bulkUpdateTickets };
};
