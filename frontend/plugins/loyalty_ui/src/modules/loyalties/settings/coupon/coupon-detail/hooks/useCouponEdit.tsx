import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { QUERY_COUPON_CAMPAIGNS } from '../../graphql';
import { QUERY_COUPON_CAMPAIGN } from '../../graphql/queries/getCampaignQuery';
import { UPDATE_COUPON_CAMPAIGN } from '../../graphql/mutations/couponEditStatusMutations';

export const useCouponEdit = (
  editCouponId?: string,
  onCompleted?: () => void,
) => {
  const { toast } = useToast();

  const refetchQueries: any[] = [QUERY_COUPON_CAMPAIGNS];
  if (editCouponId) {
    refetchQueries.push({
      query: QUERY_COUPON_CAMPAIGN,
      variables: { _id: editCouponId },
    });
  }

  const [couponEdit, { loading }] = useMutation(UPDATE_COUPON_CAMPAIGN, {
    refetchQueries,
    onCompleted: () => {
      toast({
        title: 'Success',
        description: 'Coupon updated successfully',
        variant: 'default',
      });
      onCompleted?.();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return { couponEdit, loading };
};
