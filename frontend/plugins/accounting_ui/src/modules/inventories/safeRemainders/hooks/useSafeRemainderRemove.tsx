import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { SAFE_REMAINDERS_QUERY } from '../graphql/safeRemainderQueries';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import { SAFE_REMAINDER_REMOVE } from '../graphql/safeRemainderRemove';
import { useNavigate } from 'react-router-dom';

export const useSafeRemainderRemove = (_id: string, options?: OperationVariables) => {
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
        ...options?.variables
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
        options?.onCompleted?.(data)

      },
      refetchQueries: [
        {
          query: SAFE_REMAINDERS_QUERY,
          variables: {
            ...options?.variables,
            page: 1,
            perPage: ACC_TRS__PER_PAGE,
          },
        },
      ],
      awaitRefetchQueries: true,
      update: (cache) => {
        const pathname = "/accounting/inventories/safe-remainder";
        navigate(pathname);
      },
    });
  };

  return {
    removeSafeRemainder,
    loading,
  };
};
