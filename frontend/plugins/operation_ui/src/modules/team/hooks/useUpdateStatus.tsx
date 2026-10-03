import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { UPDATE_TEAM_STATUS } from '@/team/graphql/mutations/updateTeamStatus';
import { GET_STATUSES_BY_TYPE } from '@/team/graphql/queries/getStatusesByType';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  UpdateStatusMutation,
  UpdateStatusMutationVariables,
} from '~/gql/graphql';

export const useUpdateStatus = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [updateStatus, { loading, error }] = useMutation(UPDATE_TEAM_STATUS);

  const handleUpdateStatus = (
    options: MutationFunctionOptions<
      UpdateStatusMutation,
      UpdateStatusMutationVariables
    >,
  ) => {
    updateStatus({
      ...options,
      onCompleted: (data) => {
        options?.onCompleted?.(data);
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: [GET_STATUSES_BY_TYPE],
    });
  };

  return { updateStatus: handleUpdateStatus, loading, error };
};
