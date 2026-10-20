import { gql } from '~/gql';

export const QUERY_COUPON_CAMPAIGNS = gql(`
  query GetCouponCampaigns(
    $searchValue: String
    $status: String
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    couponCampaigns(
      searchValue: $searchValue
      status: $status

      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
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
`);
