import { OperationVariables, useMutation } from '@apollo/client';
import { SAFE_REMAINDER_ADD } from '../graphql/safeRemainderAdd';
import { toast } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';

export const useSafeRemainderAdd = (options?: OperationVariables) => {
  const navigate = useNavigate();
  const [_addSafeRemainder, { loading }] = useMutation(
    SAFE_REMAINDER_ADD,
    options,
  );

  const addSafeRemainder = (options?: OperationVariables) => {
    return _addSafeRemainder({
      ...options,
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options?.onError?.(error);
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Adjust Inventory created successfully',
        });
        options?.onCompleted()
      },
      refetchQueries: ['SafeRemainders'],
      update: (_cache, { data }) => {
        const newId = data?.safeRemainderAdd[0]?.id;

        const pathname = newId
          ? `/accounting/inventories/safe-remainders/detail?id=${newId}`
          : "/accounting/inventories/safe-remainders";

        navigate(pathname);
      },
    });
  };

  return {
    addSafeRemainder,
    loading,
  };
};
