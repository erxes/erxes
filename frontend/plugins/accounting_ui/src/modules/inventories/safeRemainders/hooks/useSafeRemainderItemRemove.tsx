import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { SAFE_REMAINDER_ITEMS_REMOVE } from '../graphql/safeRemainderChange';

export const useSafeRemainderItemsRemove = () => {
  const [_removeRemItems, { loading }] = useMutation(SAFE_REMAINDER_ITEMS_REMOVE);

  const removeRemItems = (
    options: OperationVariables,
  ) => {
    const variables = options?.variables || {};

    return _removeRemItems({
      ...options,
      variables,
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Item updated successfully',
          variant: 'success',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['SafeRemainderItems'],
    });
  };

  return {
    removeRemItems,
    loading,
  };
};
