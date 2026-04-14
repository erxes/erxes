import { useToast } from 'erxes-ui';
import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { POS_ORDER_CHANGE_PAYMENTS } from '../graphql/mutations/posOrderChangePayments';

export const usePosOrderChangePayments = (
  options?: MutationFunctionOptions<{
    posOrderChangePayments: { _id: string };
  }>,
) => {
  const { toast } = useToast();
  const [posOrderChangePayments, { loading, error }] = useMutation(
    POS_ORDER_CHANGE_PAYMENTS,
    {
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      ...options,
    },
  );
  return { posOrderChangePayments, loading, error };
};
