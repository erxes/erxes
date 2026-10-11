import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ADJUST_FUND_RATE_DETAIL_QUERY } from '../graphql/adjustFundRateQueries';
import {
  ADJUST_FUND_RATE_CALCULATE,
  ADJUST_FUND_RATE_DO_TRANSACTION,
} from '../graphql/adjustFundRateRun';

export const useAdjustFundRateRun = (_id: string) => {
  const [calculateMutation, { loading: calculateLoading }] = useMutation(
    ADJUST_FUND_RATE_CALCULATE,
  );
  const [runMutation, { loading }] = useMutation(
    ADJUST_FUND_RATE_DO_TRANSACTION,
  );

  const mutationOptions = (
    options?: Pick<
      GraphqlMutationOptions<typeof ADJUST_FUND_RATE_CALCULATE>,
      'variables' | 'onError'
    >,
  ) => ({
    ...options,
    variables: { _id, ...options?.variables },
    onError: (error: ApolloError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      options?.onError?.(error);
    },
    refetchQueries: [
      {
        query: ADJUST_FUND_RATE_DETAIL_QUERY,
        variables: { _id },
      },
    ],
    awaitRefetchQueries: true,
  });

  const calculateAdjustFundRate = (
    options?: GraphqlMutationOptions<typeof ADJUST_FUND_RATE_CALCULATE>,
  ) =>
    calculateMutation({
      ...mutationOptions(options),
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Fund rate adjustment calculated successfully',
        });
        options?.onCompleted?.(data);
      },
    });

  const runAdjustFundRate = (
    options?: GraphqlMutationOptions<typeof ADJUST_FUND_RATE_DO_TRANSACTION>,
  ) =>
    runMutation({
      ...mutationOptions(options),
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Fund rate adjustment transaction created successfully',
        });
        options?.onCompleted?.(data);
      },
    });

  return {
    calculateAdjustFundRate,
    calculateLoading,
    runAdjustFundRate,
    loading,
  };
};
