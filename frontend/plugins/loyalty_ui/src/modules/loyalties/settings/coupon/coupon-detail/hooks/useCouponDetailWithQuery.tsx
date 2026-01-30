import { useQuery } from '@apollo/client';
import { ICoupon } from '../../types/couponTypes';
import { useQueryState } from 'erxes-ui';
import { getCampaignQuery } from '../../../voucher/graphql/queries/getCampaignQuery';

export const useCouponDetailWithQuery = () => {
  const [editCouponId] = useQueryState('editCouponId');

  const { data, loading, error } = useQuery(getCampaignQuery, {
    variables: {
      id: editCouponId || '',
    },
    skip: !editCouponId,
  });

  return {
    couponDetail: data?.getCampaign as ICoupon,
    loading,
    error,
  };
};
