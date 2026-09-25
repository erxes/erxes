import { OperationVariables, useMutation } from '@apollo/client';
import { ADJUST_DEBT_RATE_ADD } from '../graphql/adjustDebtRateAdd';
import { toast } from 'erxes-ui';
import { ADJUST_DEBT_RATE_QUERY } from '../graphql/adjustDebtRateQueries';

export const useAdjustDebtRateAdd = (options?: OperationVariables) => {
  const [_addAdjustDebtRate, { loading }] = useMutation(
    ADJUST_DEBT_RATE_ADD,
    options,
  );

  const addAdjustDebtRate = (options?: OperationVariables) => {
    return _addAdjustDebtRate({
      ...options,
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
          description: 'Debt Rate Adjustment created successfully',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: ADJUST_DEBT_RATE_QUERY,
          variables: {
            limit: 20,
            cursor: null,
            orderBy: { createdAt: -1 },
          },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  return {
    addAdjustDebtRate,
    loading,
  };
};
