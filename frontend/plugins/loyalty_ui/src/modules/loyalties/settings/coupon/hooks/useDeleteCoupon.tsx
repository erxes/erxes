import { useMutation } from '@apollo/client';
import { useRecordTableCursor } from 'erxes-ui';
import { COUPONS_CURSOR_SESSION_KEY } from '../constants/couponsCursorSessionKey';
import { REMOVE_COUPON_CAMPAIGNS } from '../graphql/mutations/removeCouponMutations';
import { QUERY_COUPON_CAMPAIGNS } from '../graphql/queries/getCampaignsQuery';
import { COUPONS_PER_PAGE } from './useCoupons';

export const useDeleteCoupon = () => {
  const { cursor } = useRecordTableCursor({
    sessionKey: COUPONS_CURSOR_SESSION_KEY,
  });

  const [removeCoupon, { loading }] = useMutation(REMOVE_COUPON_CAMPAIGNS, {
    refetchQueries: [
      {
        query: QUERY_COUPON_CAMPAIGNS,
        variables: {
          limit: COUPONS_PER_PAGE,
          cursor,
        },
      },
    ],
    awaitRefetchQueries: true,
  });

  return {
    removeCoupon,
    loading,
  };
};
