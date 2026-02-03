import { gql } from '@apollo/client';
import { GQL_CURSOR_PARAM_DEFS, GQL_CURSOR_PARAMS } from 'erxes-ui';

export const QUERY_VOUCHER_CAMPAIGNS = gql`
  query GetVoucherCampaigns(
    $searchValue: String
    $status: String
    $equalTypeCampaignId: String
    $voucherType: String

    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    voucherCampaigns(
      searchValue: $searchValue
      status: $status
      equalTypeCampaignId: $equalTypeCampaignId
      voucherType: $voucherType

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
`;
