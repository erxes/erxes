import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ADJUST_CLOSING_DETAIL_QUERY } from '../graphql/adjustClosingDetail';
import {
  ADJUST_CLOSING_CALCULATE,
  ADJUST_CLOSING_DO_TRANSACTION,
} from '../graphql/adjustClosingRun';

export const useAdjustClosingRun = (
  adjustId: string,
  options?: OperationVariables,
) => {
  const [_calculateMutation, { loading: calculateLoading }] = useMutation(
    ADJUST_CLOSING_CALCULATE,
    options,
  );
  const [_runMutation, { loading }] = useMutation(
    ADJUST_CLOSING_DO_TRANSACTION,
    options,
  );

  const makeOptions = (
    callOptions: OperationVariables | undefined,
    description: string,
  ) => ({
    ...callOptions,
    variables: {
      _id: adjustId,
      ...callOptions?.variables,
    },

    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      callOptions?.onError?.(error);
    },

    onCompleted: (data: unknown) => {
      toast({
        title: 'Success',
        description,
      });
      callOptions?.onCompleted?.(data);
    },

    refetchQueries: [
      {
        query: ADJUST_CLOSING_DETAIL_QUERY,
        variables: { _id: adjustId },
      },
    ],
    awaitRefetchQueries: true,
  });

  const calculateAdjust = (callOptions?: OperationVariables) => {
    return _calculateMutation(
      makeOptions(callOptions, 'Closing adjustment calculated successfully'),
    );
  };

  const runAdjust = (callOptions?: OperationVariables) => {
    return _runMutation(
      makeOptions(callOptions, 'Closing transactions created successfully'),
    );
  };

  return { calculateAdjust, calculateLoading, runAdjust, loading };
};
