import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { POS_ORDER_RETURN_BILL_MUTATION } from '../graphql/mutations/posOrderReturnBillMutation';

export const usePosOrderReturnBill = () => {
  const [posOrderReturnBill, { loading, error }] = useMutation(
    POS_ORDER_RETURN_BILL_MUTATION,
  );
  const { toast } = useToast();

  const handleReturnBill = (id: string, onSuccess?: () => void) => {
    return posOrderReturnBill({
      variables: { id },
      refetchQueries: ['PosOrders'],
      awaitRefetchQueries: true,
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Bill returned successfully',
          variant: 'success',
        });
        onSuccess?.();
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to return bill',
          variant: 'destructive',
        });
      },
    });
  };

  return {
    posOrderReturnBill: handleReturnBill,
    loading,
    error,
  };
};
