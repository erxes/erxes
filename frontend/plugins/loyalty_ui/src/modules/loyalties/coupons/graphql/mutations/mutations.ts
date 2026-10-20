import { gql } from '~/gql';

export const COUPON_ADD_MUTATION = gql(`
  mutation CouponAdd($campaignId: String!) {
    couponAdd(campaignId: $campaignId) {
      _id
      code
      campaignId
      status
      usageLimit
      usageCount
      createdAt
    }
  }
`);
