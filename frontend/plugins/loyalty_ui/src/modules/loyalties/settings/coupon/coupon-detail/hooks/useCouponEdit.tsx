import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { editCouponStatusMutation } from '../../graphql/mutations/couponEditStatusMutations';

export const useCouponEdit = () => {
  const { toast } = useToast();

  const [couponEdit, { loading }] = useMutation(editCouponStatusMutation, {
    refetchQueries: ['getCampaigns'],
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
