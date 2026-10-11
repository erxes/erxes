import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { ADJUST_FUND_RATE_CHANGE } from '../graphql/adjustFundRateChange';
import { toast } from 'erxes-ui';
import { ADJUST_FUND_RATE_QUERY } from '../graphql/adjustFundRateQueries';

export const useAdjustFundRateChange = () => {
  const [mutate, { loading }] = useMutation(ADJUST_FUND_RATE_CHANGE);

  const changeAdjustFundRate = (
    options?: GraphqlMutationOptions<typeof ADJUST_FUND_RATE_CHANGE>,
  ) => {
    return mutate({
      ...options,
      onError: (error: ApolloError) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Updated successfully',
        });
        options?.onCompleted?.(data);
      },
      refetchQueries: [ADJUST_FUND_RATE_QUERY],
    });
  };

  return { changeAdjustFundRate, loading };
};
