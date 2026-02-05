import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { QUERY_COUPON_CAMPAIGNS } from '../../graphql';
import { UPDATE_COUPON_CAMPAIGN } from '../../graphql/mutations/couponEditStatusMutations';

export const useCouponEdit = () => {
  const { toast } = useToast();

  const [couponEdit, { loading }] = useMutation(UPDATE_COUPON_CAMPAIGN, {
    refetchQueries: [QUERY_COUPON_CAMPAIGNS],
    onCompleted: () => {
      toast({
        title: 'Success',
        description: 'Coupon updated successfully',
        variant: 'default',
      });
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
