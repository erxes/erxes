import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ADJUST_CLOSING_DETAIL_QUERY } from '../graphql/adjustClosingDetail';
import { ADJUST_CLOSING_RUN } from '../graphql/adjustClosingRun';

export const useAdjustClosingRun = (
  adjustId: string,
  options?: OperationVariables,
) => {
  const [_runMutation, { loading }] = useMutation(ADJUST_CLOSING_RUN, options);

  const runAdjust = (callOptions?: OperationVariables) => {
    return _runMutation({
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

      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Closing adjust running successfully',
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
  };

  return { runAdjust, loading };
};
