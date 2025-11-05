import { useMutation } from '@apollo/client';
import { DELETE_TICKET_STATUS } from '@/status/graphql/mutation/deleteTicketStatus';
import { MutationHookOptions } from '@apollo/client';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';
import { useToast } from 'erxes-ui';
import { useParams } from 'react-router';

export const useDeleteTicketStatus = (type: number) => {
  const { toast } = useToast();
  const { pipelineId } = useParams();
  const [_deleteStatus, { loading, error }] = useMutation(DELETE_TICKET_STATUS);
  const deleteStatus = (options: MutationHookOptions) => {
    return _deleteStatus({
      refetchQueries: [
        {
          query: GET_TICKET_STATUS_BY_TYPE,
          variables: { type, pipelineId },
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
