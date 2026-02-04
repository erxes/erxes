import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { UPDATE_COUPON_CAMPAIGN } from '../graphql/mutations/couponEditStatusMutations';
import { QUERY_COUPON_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';

export function useCouponStatusEdit() {
  const { toast } = useToast();

  const [editCoupon, { loading, error }] = useMutation(UPDATE_COUPON_CAMPAIGN, {
    refetchQueries: [
      {
        query: QUERY_COUPON_CAMPAIGNS,
      },
    ],
  });

  const editStatus = async (options: MutationHookOptions<any, any>) => {
    const { variables } = options;

    return editCoupon({
      variables: {
        _id: variables._id,
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
