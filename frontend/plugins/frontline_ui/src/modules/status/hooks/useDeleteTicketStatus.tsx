import { useMutation } from '@apollo/client';
import { DELETE_TICKET_STATUS } from '@/status/graphql/mutation/deleteTicketStatus';
import { MutationHookOptions } from '@apollo/client';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';
import { useToast } from 'erxes-ui';

export const useDeleteTicketStatus = () => {
  const { toast } = useToast();
  const [_deleteStatus, { loading, error }] = useMutation(DELETE_TICKET_STATUS);
  const deleteStatus = (options: MutationHookOptions) => {
    return _deleteStatus({
      refetchQueries: [
        {
          query: GET_TICKET_STATUS_BY_TYPE,
          variables: { type: options.variables?.type },
        },
      ],
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      ...options,
    });
  };
  return { deleteStatus, loading, error };
};
