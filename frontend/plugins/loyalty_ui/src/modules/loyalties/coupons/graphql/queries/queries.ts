import { gql } from '@apollo/client';

export const COUPONS_QUERY = gql`
  query CouponsMain(
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $campaignId: String
    $ownerType: String
    $ownerId: String
    $status: String
    $fromDate: String
    $toDate: String
    $sortField: String
    $sortDirection: Int
  ) {
    coupons(
      limit: $limit
      cursor: $cursor
      direction: $direction
      campaignId: $campaignId
      ownerType: $ownerType
      ownerId: $ownerId
      status: $status
      fromDate: $fromDate
      toDate: $toDate
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      list {
        _id
        code
        campaignId
        campaign {
          title
        }
        ownerType
        ownerId
        status
        usageLimit
        usageCount
        redemptionLimitPerUser
        createdAt
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

export const QUERY_COUPON_CAMPAIGNS = gql`
  query CouponCampaignsSelect($status: String, $searchValue: String, $perPage: Int) {
    couponCampaigns(status: $status, searchValue: $searchValue, limit: $perPage) {
      list {
        _id
        title
        status
      }
    }
  }
`;
