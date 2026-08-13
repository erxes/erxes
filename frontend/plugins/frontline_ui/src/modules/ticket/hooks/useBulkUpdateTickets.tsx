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

export type TBulkUpdateResult = {
  succeededIds: string[];
  failedIds: string[];
};

export type TBulkUpdateOptions = {
  successMessage: string;
  /** Refetch the ticket list once, after every update settled. */
  refetchList?: boolean;
  /** Called with the tickets that failed, so callers roll back only those. */
  onError?: (failedIds: string[]) => void;
};

export type TUseBulkUpdateTickets = {
  bulkUpdateTickets: (
    ticketIds: string[],
    update: TBulkTicketUpdate,
    options: TBulkUpdateOptions,
  ) => Promise<TBulkUpdateResult>;
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
    const results = await Promise.all(
      ticketIds.map(async (ticketId) => {
        let errorMessage = '';

        await updateTicket({
          variables: {
            _id: ticketId,
            ...update,
          },
          onError: (error) => {
            errorMessage = error.message;
          },
        });

        return { ticketId, errorMessage };
      }),
    );

    const succeededIds = results
      .filter((result) => !result.errorMessage)
      .map((result) => result.ticketId);
    const failures = results.filter((result) => result.errorMessage);
    const failedIds = failures.map((result) => result.ticketId);

    // Tickets that did change still have to leave a stale list, even when a
    // sibling in the same batch failed. A refetch that itself fails must not
    // hide the mutation outcome, so it only downgrades the feedback.
    let refetchFailed = false;

    if (refetchList && succeededIds.length > 0) {
      try {
        await client.refetchQueries({ include: [GET_TICKETS] });
      } catch {
        refetchFailed = true;
      }
    }

    // A stale list has to be reported even when the batch also had a mutation
    // failure, otherwise the tickets that did change look untouched.
    const refreshHint = refetchFailed ? ` ${t('tickets-refresh-failed')}` : '';

    if (failures.length > 0) {
      onError?.(failedIds);
      toast({
        title: t('error'),
        description: failures[0].errorMessage + refreshHint,
        variant: 'destructive',
      });
    } else if (refetchFailed) {
      // The mutations landed, so nothing rolls back.
      toast({
        title: t('error'),
        description: successMessage + refreshHint,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('success'),
        variant: 'success',
        description: successMessage,
      });
    }

    return { succeededIds, failedIds };
  };

  return { bulkUpdateTickets };
};
