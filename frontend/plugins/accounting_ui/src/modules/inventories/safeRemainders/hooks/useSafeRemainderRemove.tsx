import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { SAFE_REMAINDER_REMOVE } from '../graphql/safeRemainderRemove';
import { useNavigate } from 'react-router-dom';

export const useSafeRemainderRemove = (
  _id: string,
  options?: OperationVariables,
) => {
  const navigate = useNavigate();
  const [_removeMutation, { loading }] = useMutation(
    SAFE_REMAINDER_REMOVE,
    options,
  );

  const removeSafeRemainder = (options?: OperationVariables) => {
    return _removeMutation({
      ...options,
      variables: {
        _id,
        ...options?.variables,
      },
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Inventory safe remainder deleted successfully',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: ['SafeRemainders'],
      update: (cache) => {
        const pathname = '/accounting/inventories/safe-remainder';
        navigate(pathname);
      },
    });
  };

  return {
    removeSafeRemainder,
    loading,
  };
};
