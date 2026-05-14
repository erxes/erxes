import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { QUERY_COUPON_CAMPAIGN } from '../../graphql/queries/getCampaignQuery';
import { ICoupon } from '../../types/couponTypes';

export const useCouponDetailWithQuery = () => {
  const [editCouponId] = useQueryState('editCouponId');

  const { data, loading, error } = useQuery(QUERY_COUPON_CAMPAIGN, {
    variables: {
      _id: editCouponId || '',
    },
    skip: !editCouponId,
  });

  return {
    couponDetail: data?.couponCampaign as ICoupon,
    loading,
    error,
  };
};
