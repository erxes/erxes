import { gql } from '@apollo/client';

export const QUERY_VOUCHER_CAMPAIGN = gql`
  query GetVoucherCampaign($_id: String!) {
    voucherCampaignDetail(_id: $_id) {
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
  }
`;
