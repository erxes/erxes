import { gql } from '@apollo/client';

export const QUERY_COUPON_CAMPAIGN = gql`
  query GetCouponCampaign($_id: String) {
    couponCampaign(_id: $_id) {
      _id
      createdAt
      createdBy
      modifiedAt
      modifiedBy
      title
      description
      startDate
      endDate
      finishDateOfUse
      attachment {
        url
        name
        type
        size
        duration
      }
      status
      kind
      value
      codeRule
      restrictions
      redemptionLimitPerUser
      buyScore
    }
  }
`;
