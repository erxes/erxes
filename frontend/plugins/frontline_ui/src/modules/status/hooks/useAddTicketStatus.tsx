import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { ADD_TICKET_STATUS } from '@/status/graphql/mutation/addTicketStatus';
import { useToast } from 'erxes-ui';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';

export const useAddTicketStatus = () => {
  const { toast } = useToast();
  const [_addStatus, { loading, error }] = useMutation(ADD_TICKET_STATUS);
  const addStatus = (options: MutationFunctionOptions) => {
    return _addStatus({
      onCompleted: () => {
        toast({
          title: 'Success!',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: [
        {
          query: GET_TICKET_STATUS_BY_TYPE,
          variables: { type: options?.variables?.type },
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
