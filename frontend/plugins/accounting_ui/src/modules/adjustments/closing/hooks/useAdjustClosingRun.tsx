import type { ApolloError } from '@apollo/client';
import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import type { MutationHookOptions } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ADJUST_CLOSING_DETAIL_QUERY } from '../graphql/adjustClosingDetail';
import {
  ADJUST_CLOSING_CALCULATE,
  ADJUST_CLOSING_DO_TRANSACTION,
} from '../graphql/adjustClosingRun';

export const useAdjustClosingRun = (
  adjustId: string,
  options?: Pick<
    GraphqlMutationOptions<typeof ADJUST_CLOSING_CALCULATE>,
    'onError' | 'fetchPolicy' | 'errorPolicy'
  >,
) => {
  const [_calculateMutation, { loading: calculateLoading }] = useMutation(
    ADJUST_CLOSING_CALCULATE,
    options,
  );
  const [_runMutation, { loading }] = useMutation(
    ADJUST_CLOSING_DO_TRANSACTION,
    options,
  );

  const makeOptions = <Data,>(
    callOptions: MutationHookOptions<Data, { _id: string }> | undefined,
    description: string,
  ) => ({
    ...callOptions,
    variables: {
      _id: adjustId,
      ...callOptions?.variables,
    },

    onError: (error: ApolloError) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      callOptions?.onError?.(error);
    },

    onCompleted: (data: Data) => {
      toast({
        title: 'Success',
        description,
      });
      callOptions?.onCompleted?.(data);
    },

    refetchQueries: [
      {
        query: ADJUST_CLOSING_DETAIL_QUERY,
        variables: { _id: adjustId ?? '' },
      },
    ],
    awaitRefetchQueries: true,
  });

  const calculateAdjust = (
    callOptions?: GraphqlMutationOptions<typeof ADJUST_CLOSING_CALCULATE>,
  ) => {
    return _calculateMutation(
      makeOptions(callOptions, 'Closing adjustment calculated successfully'),
    );
  };

  const runAdjust = (
    callOptions?: GraphqlMutationOptions<typeof ADJUST_CLOSING_DO_TRANSACTION>,
  ) => {
    return _runMutation(
      makeOptions(callOptions, 'Closing transactions created successfully'),
    );
  };

  return { calculateAdjust, calculateLoading, runAdjust, loading };
};
