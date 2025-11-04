import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { ADD_TICKET_STATUS } from '@/status/graphql/mutation/addTicketStatus';
import { useToast } from 'erxes-ui';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';

export const useAddTicketStatus = () => {
  const { toast } = useToast();
  const [_addStatus, { loading, error }] = useMutation(ADD_TICKET_STATUS);
  const addStatus = (options: MutationFunctionOptions) => {
    return _addStatus({
      ...options,
      onCompleted: (data) => {
        toast({
          title: 'Success!',
        });
        options.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options.onError?.(error);
      },
      refetchQueries: [
        {
          query: GET_TICKET_STATUS_BY_TYPE,
          variables: { type: options?.variables?.type, pipelineId: options?.variables?.pipelineId },
        },
      ],
    });
  };
  return {
    addStatus,
    loading,
    error,
  };
};
