import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ADJUST_CLOSING_DETAIL_QUERY } from '../graphql/adjustClosingDetail';
import { ADJUST_CLOSING_RUN } from '../graphql/adjustClosingRun';

export const useAdjustClosingRun = (
  adjustId: string,
  options?: OperationVariables,
) => {
  const [_runMutation, { loading }] = useMutation(ADJUST_CLOSING_RUN, options);

  const runAdjust = (options?: OperationVariables) => {
    return _runMutation({
      ...options,
      variables: {
        adjustId,
        ...options?.variables,
      },

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
          description: 'Closing adjust running successfully',
        });
        options?.onCompleted?.(data);
      },

      refetchQueries: [
        {
          query: ADJUST_CLOSING_DETAIL_QUERY,
          variables: {
            _id: adjustId,
          },
        },
      ],

      awaitRefetchQueries: true,
    });
  };

  return {
    runAdjust,
    loading,
  };
};
