import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ADJUST_FUND_RATE_DETAIL_QUERY } from '../graphql/adjustFundRateQueries';
import { ADJUST_FUND_RATE_RUN } from '../graphql/adjustFundRateRun';

export const useAdjustFundRateRun = (_id: string) => {
  const [runMutation, { loading }] = useMutation(ADJUST_FUND_RATE_RUN);

  const runAdjustFundRate = (options?: OperationVariables) =>
    runMutation({
      ...options,
      variables: { _id, ...options?.variables },
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
          description: 'Fund rate adjustment calculated successfully',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [
        {
          query: ADJUST_FUND_RATE_DETAIL_QUERY,
          variables: { _id },
        },
      ],
      awaitRefetchQueries: true,
    });

  return { runAdjustFundRate, loading };
};
