import { useMutation, MutationHookOptions } from '@apollo/client';
import { UPDATE_TICKET_MUTATION } from '@/ticket/graphql/mutations/updateTicket';
import { isTicketRemoved } from '@/ticket/states/removedTicketsState';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  UpdateTicketMutation,
  UpdateTicketMutationVariables,
} from '~/gql/graphql';

export const useUpdateTicket = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const [_updateTicket, { loading, error }] = useMutation(
    UPDATE_TICKET_MUTATION,
  );
  const updateTicket = (
    options: MutationHookOptions<
      UpdateTicketMutation,
      UpdateTicketMutationVariables
    >,
  ) => {
    const ticketId = options.variables?._id;
    if (isTicketRemoved(ticketId)) {
      return Promise.resolve({ data: undefined });
    }
    return _updateTicket({
      ...options,
      onError: (error) => {
        options.onError?.(error);

        if (!options.onError) {
          toast({
            title: t('error', 'Error'),
            description: error.message,
            variant: 'destructive',
          });
        }
      },
      onCompleted: (data) => {
        options.onCompleted?.(data);
      },
    });
  };

  return { updateTicket, loading, error };
};
