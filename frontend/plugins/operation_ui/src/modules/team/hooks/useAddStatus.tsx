import { useMutation, MutationHookOptions } from '@apollo/client';
import { ADD_STATUS } from '../graphql/mutations/addStatus';
import { GET_STATUSES_BY_TYPE } from '../graphql/queries/getStatusesByType';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';


export const useAddStatus = () => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const [_addStatus, { loading, error }] = useMutation(ADD_STATUS);
  const addStatus = (options: MutationHookOptions) => {
    return _addStatus({
      update: (cache, { data }) => {
        const existingData = cache.readQuery({
          query: GET_STATUSES_BY_TYPE,
          variables: {
            type: options?.variables?.type,
            teamId: options?.variables?.teamId,
          },
        }) as { getStatusesByType: any[] } | null;

        if (existingData && data?.addStatus) {
          cache.writeQuery({
            query: GET_STATUSES_BY_TYPE,
            variables: {
              type: options?.variables?.type,
              teamId: options?.variables?.teamId,
            },
            data: {
              getStatusesByType: [
                ...existingData.getStatusesByType,
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
