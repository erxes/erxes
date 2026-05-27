import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { COUPON_ADD_MUTATION } from '../graphql/mutations/mutations';

export const useAddCoupon = () => {
  const { toast } = useToast();

  const [addCoupon, { loading, error }] = useMutation(COUPON_ADD_MUTATION);

  const couponAdd = async (campaignId: string) => {
    return addCoupon({
      variables: { campaignId },
      update(cache, { data }) {
        const newCoupons = data?.couponAdd;
        if (!newCoupons?.length) return;

        cache.modify({
          fields: {
            coupons(existing = {}) {
              return {
                ...existing,
                list: [...newCoupons, ...(existing.list || [])],
                totalCount: (existing.totalCount || 0) + newCoupons.length,
              };
            },
          },
        });
      },
      onCompleted: (data) => {
        const count = data?.couponAdd?.length || 1;
        toast({
          title: 'Success',
          description: `${count} coupon${count > 1 ? 's' : ''} created successfully`,
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { couponAdd, loading, error };
};
