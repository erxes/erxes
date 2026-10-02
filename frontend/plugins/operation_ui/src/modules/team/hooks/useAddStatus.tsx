import { useMutation, MutationHookOptions } from '@apollo/client';
import { ADD_STATUS } from '../graphql/mutations/addStatus';
import { GET_STATUSES_BY_TYPE } from '../graphql/queries/getStatusesByType';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type {
  AddStatusMutation,
  AddStatusMutationVariables,
} from '~/gql/graphql';


export const useAddStatus = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [_addStatus, { loading, error }] = useMutation(ADD_STATUS);
  const addStatus = (
    options: MutationHookOptions<
      AddStatusMutation,
      AddStatusMutationVariables
    >,
  ) => {
    return _addStatus({
      update: (cache, { data }) => {
        const { type, teamId } = options?.variables ?? {};

        if (type == null || teamId == null || !data?.addStatus) {
          return;
        }

        const existingData = cache.readQuery({
          query: GET_STATUSES_BY_TYPE,
          variables: { type, teamId },
        });

        if (existingData) {
          cache.writeQuery({
            query: GET_STATUSES_BY_TYPE,
            variables: { type, teamId },
            data: {
              getStatusesByType: [
                ...(existingData.getStatusesByType ?? []),
                data.addStatus,
              ],
            },
          });
        }
      },
      onError: (e) => {
        toast({
          title: t('error'),
          description: e.message,
          variant: 'destructive',
        });
      },
      ...options,
    });
  };
  return { addStatus, loading, error };
};
