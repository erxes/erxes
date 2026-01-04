import { OperationVariables, useMutation } from '@apollo/client';
import { ADJUST_FUND_RATE_CHANGE } from '../graphql/adjustFundRateChange';
import { toast } from 'erxes-ui';
import { ADJUST_FUND_RATE_QUERY } from '../graphql/adjustFundRateQueries';

export const useAdjustFundRateChange = () => {
  const [mutate, { loading }] = useMutation(ADJUST_FUND_RATE_CHANGE);

  const changeAdjustFundRate = (options?: OperationVariables) => {
    return mutate({
      ...options,
      onError: (error: Error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Updated successfully',
        });
        options?.onCompleted?.();
      },
      refetchQueries: [ADJUST_FUND_RATE_QUERY],
    });
  };

  return { changeAdjustFundRate, loading };
};
