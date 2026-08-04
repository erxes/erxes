import { gql } from '@apollo/client';

export const COUPON_ADD_MUTATION = gql`
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
`;

export const COUPON_EDIT_MUTATION = gql`
  mutation CouponEdit(
    $_id: String!
    $status: String
    $usageLimit: Int
    $redemptionLimitPerUser: Int
  ) {
    couponEdit(
      _id: $_id
      status: $status
      usageLimit: $usageLimit
      redemptionLimitPerUser: $redemptionLimitPerUser
    ) {
      _id
      code
      campaignId
      status
      usageLimit
      usageCount
      redemptionLimitPerUser
      createdAt
    }
  }
`;

export const COUPONS_REMOVE_MUTATION = gql`
  mutation CouponsRemove($_ids: [String]) {
    couponsRemove(_ids: $_ids)
  }
`;
