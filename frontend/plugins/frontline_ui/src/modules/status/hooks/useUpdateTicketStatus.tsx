import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { UPDATE_TICKET_STATUS } from '@/status/graphql/mutation/updateTicketStatus';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';
import {
  GET_ACCESSIBLE_TICKET_STATUSES,
  GET_TICKET_STATUS_BY_PIPELINE,
} from '@/status/graphql/query/getTicketStatusesByPipelines';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  UpdateTicketStatusMutation,
  UpdateTicketStatusMutationVariables,
} from '~/gql/graphql';

/** Updates a ticket status and forwards callbacks while refreshing status queries. */
export const useUpdateTicketStatus = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.status' });
  const { toast } = useToast();
  const [updateStatus, { loading, error }] = useMutation(UPDATE_TICKET_STATUS);

  /** Runs the status mutation and preserves the caller's completion and error handling. */
  const handleUpdateStatus = (
    options: MutationFunctionOptions<
      UpdateTicketStatusMutation,
      UpdateTicketStatusMutationVariables
    >,
  ) => {
    return updateStatus({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: t('error', 'Error'),
          description: t('update-failed', 'Update failed: {{message}}', {
            message: error.message,
          }),
          variant: 'destructive',
        });
        options.onError?.(error);
      },
      refetchQueries: [
        GET_TICKET_STATUS_BY_TYPE,
        GET_TICKET_STATUS_BY_PIPELINE,
        GET_ACCESSIBLE_TICKET_STATUSES,
      ],
    });
  };

  return { updateStatus: handleUpdateStatus, loading, error };
};
