import { OperationVariables, useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { ADJUST_CLOSING_PUBLISH } from '../graphql/adjustClosingPublish';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';
import {
  ADJUST_CLOSING_DETAIL_QUERY,
  ADJUST_CLOSING_DETAILS,
} from '../graphql/adjustClosingDetail';

export const useAdjustClosingPublish = (
  adjustId: string,
  options?: OperationVariables,
) => {
  const [_publishMutation, { loading }] = useMutation(
    ADJUST_CLOSING_PUBLISH,
    options,
  );

  const publishAdjust = (options?: OperationVariables) => {
    return _publishMutation({
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
          description: 'Closing adjust published successfully',
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
    publishAdjust,
    loading,
  };
};
