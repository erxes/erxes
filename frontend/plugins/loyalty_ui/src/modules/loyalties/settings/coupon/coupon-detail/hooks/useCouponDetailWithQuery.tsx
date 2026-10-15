import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { QUERY_COUPON_CAMPAIGN } from '../../graphql/queries/getCampaignQuery';

export const useCouponDetailWithQuery = () => {
  const [editCouponId] = useQueryState<string>('editCouponId');

  const { data, loading, error } = useQuery(QUERY_COUPON_CAMPAIGN, {
    variables: {
      _id: editCouponId || '',
    },
    skip: !editCouponId,
  });

  return {
    couponDetail: data?.couponCampaign ?? undefined,
    loading,
    error,
  };
};
