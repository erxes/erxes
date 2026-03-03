import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { SAFE_REMAINDERS_QUERY } from '../graphql/safeRemainderQueries';
import { SAFE_REMAINDER_REMOVE } from '../graphql/safeRemainderRemove';
import { useSafeRemainderQueryParams } from './useSafeRemainders';

export const useSafeRemainderRemove = () => {
  const navigate = useNavigate();
  const [_removeMutation, { loading }] = useMutation(
    SAFE_REMAINDER_REMOVE,
  );

  const removeSafeRemainder = (options?: OperationVariables) => {
    const queryParams = useSafeRemainderQueryParams();
    const variables = options?.variables || {};
    return _removeMutation({
      ...options,
      variables,
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
        const pathname = '/accounting/inventories/safe-remainders';
        navigate(pathname);
      },
      refetchQueries: [
        {
          query: SAFE_REMAINDERS_QUERY,
          variables: {
            ...queryParams,
          },
        },
      ],
    });
  };

  return {
    removeSafeRemainder,
    loading,
  };
};
