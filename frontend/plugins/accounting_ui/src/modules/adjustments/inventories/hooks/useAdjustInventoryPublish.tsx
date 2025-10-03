import { OperationVariables, useMutation } from '@apollo/client';
import { ADJUST_INVENTORY_PUBLISH } from '../graphql/adjustInventoryChange';
import { toast } from 'erxes-ui';
import { ADJUST_INVENTORY_DETAIL_QUERY, ADJUST_INVENTORY_DETAILS_QUERY } from '../graphql/adjustInventoryQueries';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

export const useAdjustInventoryPublish = (adjustId: string, options?: OperationVariables) => {
  const [_publishMutation, { loading }] = useMutation(
    ADJUST_INVENTORY_PUBLISH,
    options,
  );

  const publishAdjust = (options?: OperationVariables) => {

    return _publishMutation({
      ...options,
      variables: {
        adjustId,
        ...options?.variables
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
          description: 'Inventory adjust running successfully',
        });
        options?.onCompleted?.(data)
      },
      refetchQueries: [
        {
          query: ADJUST_INVENTORY_DETAIL_QUERY,
          variables: {
            _id: adjustId
          }
        },
        {
          query: ADJUST_INVENTORY_DETAILS_QUERY,
          variables: {
            _id: adjustId,
            page: 1,
            perPage: ACC_TRS__PER_PAGE,
          },
        }
      ],
      awaitRefetchQueries: true,
    });
  };

  return {
    publishAdjust,
    loading,
  };
};
