import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { SAFE_REMAINDER_ITEM_REMOVE } from '../graphql/safeRemainderChange';

export const useSafeRemainderItemRemove = () => {
  const [_removeRemItem, { loading }] = useMutation(SAFE_REMAINDER_ITEM_REMOVE);

  const removeRemItem = (
    options: OperationVariables,
    fields: string[],
  ) => {
    const variables = options?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
    return _removeRemItem({
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
    removeRemItem,
    loading,
  };
};
