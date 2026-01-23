import { OperationVariables, useMutation } from '@apollo/client';
import { ADJUST_FUND_RATE_REMOVE } from '../graphql/adjustFundRateRemove';
import { toast } from 'erxes-ui';
import { ADJUST_FUND_RATE_QUERY } from '../graphql/adjustFundRateQueries';
import { useNavigate } from 'react-router-dom';

export const useAdjustFundRateRemove = (options?: OperationVariables) => {
  const navigate = useNavigate();
  const [_removeAdjustFundRate, { loading }] = useMutation(
    ADJUST_FUND_RATE_REMOVE,
    options,
  );

  const removeAdjustFundRate = (options?: OperationVariables) => {
    return _removeAdjustFundRate({
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
          description: 'Fund Rate Adjustment removed successfully',
        });
        options?.onCompleted?.();
      },
      refetchQueries: [
        {
          query: ADJUST_FUND_RATE_QUERY,
          variables: {
            limit: 20,
            cursor: null,
            orderBy: { createdAt: -1 },
          },
        },
      ],
      awaitRefetchQueries: true,
      update: (cashe) => {
        const pathname = '/accounting/adjustment/fundRate';
        navigate(pathname);
      },
    });
  };

  return { removeAdjustFundRate, loading };
};
