import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { COUPON_ADD_MUTATION } from '../graphql/mutations/mutations';

export const useAddCoupon = () => {
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');

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
          title: t('success'),
          description: t('coupon-created', { count }),
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: t('error'),
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { couponAdd, loading, error };
};
