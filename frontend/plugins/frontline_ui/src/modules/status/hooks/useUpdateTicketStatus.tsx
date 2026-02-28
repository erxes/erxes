import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { ITicketStatus } from '@/status/types';
import { UPDATE_TICKET_STATUS } from '@/status/graphql/mutation/updateTicketStatus';
import { GET_TICKET_STATUS_BY_TYPE } from '@/status/graphql/query/getTicketStatusByType';
import { useToast } from 'erxes-ui';

interface UpdateStatusMutationResponse {
  updateStatus: ITicketStatus;
}

export const useUpdateTicketStatus = () => {
  const { toast } = useToast();
  const [updateStatus, { loading, error }] =
    useMutation<UpdateStatusMutationResponse>(UPDATE_TICKET_STATUS);

  const handleUpdateStatus = (
    options: MutationFunctionOptions<UpdateStatusMutationResponse, any>,
  ): Promise<any> => {
    return updateStatus({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: 'Update failed',
          variant: 'destructive',
        });
      },
      refetchQueries: [GET_TICKET_STATUS_BY_TYPE],
    });
  };

  return { updateStatus: handleUpdateStatus, loading, error };
};
