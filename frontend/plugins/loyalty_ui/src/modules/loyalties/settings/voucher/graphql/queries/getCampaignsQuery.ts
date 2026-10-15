import { gql } from '~/gql';

export const QUERY_VOUCHER_CAMPAIGNS = gql(`
  query VoucherCampaigns(
    $searchValue: String
    $status: String
    $equalTypeCampaignId: String
    $voucherType: String
    $excludeVoucherTypes: [String]
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    voucherCampaigns(
      searchValue: $searchValue
      status: $status
      equalTypeCampaignId: $equalTypeCampaignId
      voucherType: $voucherType
      excludeVoucherTypes: $excludeVoucherTypes

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
          size
          type
          __typename
        }
        status
        buyScore
        score
        scoreAction
        voucherType
        productCategoryIds
        productIds
        discountPercent
        bonusProductId
        bonusCount
        coupon
        spinCampaignId
        spinCount
        lotteryCampaignId
        lotteryCount
        vouchersCount
        codesCount
        kind
        value
        restrictions
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
