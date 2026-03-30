import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useNavigate } from 'react-router-dom';
import { RE_CALC_REMAINDERS } from '../graphql';

export const useReCalcRemainders = (options?: OperationVariables) => {
  const navigate = useNavigate();
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
          description: 'Adjust Inventory created successfully',
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
