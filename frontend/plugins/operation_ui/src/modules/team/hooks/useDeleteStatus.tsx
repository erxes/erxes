import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { DELETE_STATUS } from '../graphql/mutations/deleteStatus';
import { GET_STATUSES_BY_TYPE } from '../graphql/queries/getStatusesByType';

export const useDeleteStatus = () => {
  const { toast } = useToast();
  const [_deleteStatus, { loading, error }] = useMutation(DELETE_STATUS);
  const deleteStatus = (options: MutationHookOptions) => {
    return _deleteStatus({
      refetchQueries: [GET_STATUSES_BY_TYPE],
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
