import { useMutation, MutationHookOptions } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { getCampaignsQuery } from '../graphql/queries/getCampaignsQuery';
import { editCouponStatusMutation } from '../graphql/mutations/couponEditStatusMutations';

export function useCouponStatusEdit() {
  const { toast } = useToast();

  const [editCoupon, { loading, error }] = useMutation(
    editCouponStatusMutation,
    {
      refetchQueries: [
        {
          query: getCampaignsQuery,
        },
      ],
    },
  );

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editCoupon({
      variables: {
        id: variables._id,
        kind: 'coupon',
        status: variables.status,
      },
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Coupon status updated successfully',
          variant: 'default',
        });
        options?.onCompleted?.(data);
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        options?.onError?.(err);
      },
    });
  };

  return { editStatus, loading, error };
}
