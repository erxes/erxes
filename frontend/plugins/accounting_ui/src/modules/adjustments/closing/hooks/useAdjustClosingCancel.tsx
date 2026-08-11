import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ADJUST_CLOSING_CANCEL } from '../graphql/adjustClosingCancel';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import {
  ADJUST_CLOSING_DETAIL_QUERY,
  ADJUST_CLOSING_DETAILS,
} from '../graphql/adjustClosingDetail';

export const useAdjustClosingCancel = (
  adjustId: string,
  options?: OperationVariables,
) => {
  const [_cancelMutation, { loading }] = useMutation(
    ADJUST_CLOSING_CANCEL,
    options,
  );

  const cancelAdjust = (options?: OperationVariables) => {
    return _cancelMutation({
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
          description: 'Closing adjust cancelled successfully',
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
        {
          query: ADJUST_CLOSING_DETAILS,
          variables: {
            _id: adjustId,
            page: 1,
            perPage: ACC_TRS__PER_PAGE,
          },
        },
      ],
      awaitRefetchQueries: true,
    });
  };

  return {
    cancelAdjust,
    loading,
  };
};
