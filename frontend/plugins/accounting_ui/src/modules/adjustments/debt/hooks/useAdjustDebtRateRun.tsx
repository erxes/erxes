import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ADJUST_DEBT_RATE_DETAIL_QUERY } from '../graphql/adjustDebtRateQueries';
import {
  ADJUST_DEBT_RATE_CALCULATE,
  ADJUST_DEBT_RATE_DO_TRANSACTION,
} from '../graphql/adjustDebtRateRun';

export const useAdjustDebtRateRun = (_id: string) => {
  const [calculateMutation, { loading: calculateLoading }] = useMutation(
    ADJUST_DEBT_RATE_CALCULATE,
  );
  const [runMutation, { loading }] = useMutation(
    ADJUST_DEBT_RATE_DO_TRANSACTION,
  );

  const mutationOptions = (
    options?: Pick<
      GraphqlMutationOptions<typeof ADJUST_DEBT_RATE_CALCULATE>,
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
        query: ADJUST_DEBT_RATE_DETAIL_QUERY,
        variables: { _id },
      },
    ],
    awaitRefetchQueries: true,
  });

  const calculateAdjustDebtRate = (
    options?: GraphqlMutationOptions<typeof ADJUST_DEBT_RATE_CALCULATE>,
  ) =>
    calculateMutation({
      ...mutationOptions(options),
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Debt rate adjustment calculated successfully',
        });
        options?.onCompleted?.(data);
      },
    });

  const runAdjustDebtRate = (
    options?: GraphqlMutationOptions<typeof ADJUST_DEBT_RATE_DO_TRANSACTION>,
  ) =>
    runMutation({
      ...mutationOptions(options),
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Debt rate adjustment transaction created successfully',
        });
        options?.onCompleted?.(data);
      },
    });

  return {
    calculateAdjustDebtRate,
    calculateLoading,
    runAdjustDebtRate,
    loading,
  };
};
