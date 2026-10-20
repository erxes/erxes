import { gql } from '~/gql';

export const REMOVE_COUPON_CAMPAIGNS = gql(`
  mutation RemoveCouponCampaign($_ids: [String!]!) {
    couponCampaignsRemove(_ids: $_ids)
  }
`);
