import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { ITeamStatus } from '@/team/types';

import { UPDATE_TEAM_STATUS } from '@/team/graphql/mutations/updateTeamStatus';
import { GET_STATUSES_BY_TYPE } from '@/team/graphql/queries/getStatusesByType';
import { useToast } from 'erxes-ui';

interface UpdateStatusMutationResponse {
  updateStatus: ITeamStatus;
}

export const useUpdateStatus = () => {
  const { toast } = useToast();
  const [updateStatus, { loading, error }] =
    useMutation<UpdateStatusMutationResponse>(UPDATE_TEAM_STATUS);

  const handleUpdateStatus = (
    options: MutationFunctionOptions<UpdateStatusMutationResponse, any>,
  ) => {
    updateStatus({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: [GET_STATUSES_BY_TYPE],
    });
  };

  return { updateStatus: handleUpdateStatus, loading, error };
};
