import { useMutation, MutationHookOptions } from '@apollo/client';
import { ADD_STATUS } from '../graphql/mutations/addStatus';
import { GET_STATUSES_BY_TYPE } from '../graphql/queries/getStatusesByType';
import { useToast } from 'erxes-ui';


export const useAddStatus = () => {
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
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      ...options,
    });
  };
  return { addStatus, loading, error };
};
