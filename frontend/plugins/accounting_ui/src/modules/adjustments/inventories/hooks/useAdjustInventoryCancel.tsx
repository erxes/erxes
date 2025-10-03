import { OperationVariables, useMutation } from '@apollo/client';
import { ADJUST_INVENTORY_CANCEL } from '../graphql/adjustInventoryChange';
import { toast } from 'erxes-ui';
import { ADJUST_INVENTORY_DETAIL_QUERY, ADJUST_INVENTORY_DETAILS_QUERY } from '../graphql/adjustInventoryQueries';
import { ACC_TRS__PER_PAGE } from '@/transactions/types/constants';

export const useAdjustInventoryCancel = (adjustId: string, options?: OperationVariables) => {
  const [_cancelMutation, { loading }] = useMutation(
    ADJUST_INVENTORY_CANCEL,
    options,
  );

  const cancelAdjust = (options?: OperationVariables) => {

    return _cancelMutation({
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
    cancelAdjust,
    loading,
  };
};
