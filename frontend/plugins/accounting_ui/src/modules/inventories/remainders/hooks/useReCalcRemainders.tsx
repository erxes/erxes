import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { RE_CALC_REMAINDERS } from '../graphql';

export const useReCalcRemainders = (options?: OperationVariables) => {
  const [_addSafeRemainder, { loading }] = useMutation(
    RE_CALC_REMAINDERS,
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
          description: 'Re Calced successfully',
        });
        options?.onCompleted();
      },
      refetchQueries: ['ProductsRemainderMain'],
    });
  };

  return {
    addSafeRemainder,
    loading,
  };
};
