import { gql } from '@apollo/client';
import { GQL_CURSOR_PARAM_DEFS, GQL_CURSOR_PARAMS } from 'erxes-ui';

export const QUERY_COUPON_CAMPAIGNS = gql`
  query GetCouponCampaigns(
    $searchValue: String
    $status: String
   
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    couponCampaigns(
      searchValue: $searchValue
      status: $status
      
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
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
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
