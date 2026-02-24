import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { SAFE_REMAINDER_ITEM_EDIT } from '../graphql/safeRemainderChange';

export const useSafeRemainderItemEdit = () => {
  const [_editRemItem, { loading }] = useMutation(SAFE_REMAINDER_ITEM_EDIT);

  const editRemItem = (
    options: OperationVariables,
    fields: string[],
  ) => {
    const variables = options?.variables || {};
    const fieldsToUpdate: Record<string, () => any> = {};
    fields.forEach((field) => {
      fieldsToUpdate[field] = () => variables[field];
    });
    return _editRemItem({
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
      refetchQueries: ['AccountsMain'],
    });
  };

  return {
    editRemItem,
    loading,
  };
};
