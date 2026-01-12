import { OperationVariables, useMutation } from '@apollo/client';
import {
  ADJUST_DEBT_RATE_CHANGE,
  ADJUST_DEBT_RATE_REMOVE,
} from '../graphql/adjustDebtRateChange';
import { toast } from 'erxes-ui';
import { ADJUST_DEBT_RATE_QUERY } from '../graphql/adjustDebtRateQueries';
import { useNavigate } from 'react-router-dom';

export const useAdjustDebtRateChange = (options?: OperationVariables) => {
  const [_changeAdjustDebtRate, { loading }] = useMutation(
    ADJUST_DEBT_RATE_CHANGE,
    options,
  );

  const changeAdjustDebtRate = (options?: OperationVariables) => {
    return _changeAdjustDebtRate({
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
          description: 'Debt Rate Adjustment updated successfully',
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
    changeAdjustDebtRate,
    loading,
  };
};

export const useAdjustDebtRateRemove = (options?: OperationVariables) => {
  const navigate = useNavigate();
  const [_removeAdjustDebtRate, { loading }] = useMutation(
    ADJUST_DEBT_RATE_REMOVE,
    options,
  );

  const removeAdjustDebtRate = (options?: OperationVariables) => {
    return _removeAdjustDebtRate({
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
          description: 'Debt Rate Adjustment removed successfully',
        });
        options?.onCompleted?.();
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
      update: () => {
        const pathname = '/accounting/adjustment/debtRate';
        navigate(pathname);
      },
    });
  };

  return {
    removeAdjustDebtRate,
    loading,
  };
};
