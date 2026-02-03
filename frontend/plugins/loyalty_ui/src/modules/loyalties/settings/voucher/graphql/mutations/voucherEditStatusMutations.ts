import { gql } from '@apollo/client';

export const UPDATE_VOUCHER_CAMPAIGN = gql`
  mutation UpdateVoucherCampaign(
    $_id: String!
    $title: String
    $description: String
    $startDate: Date
    $endDate: Date
    $finishDateOfUse: Date
    $attachment: AttachmentInput
    $status: String
    $buyScore: Float
    $score: Float
    $scoreAction: String
    $voucherType: String
    $productCategoryIds: [String]
    $productIds: [String]
    $discountPercent: Float
    $bonusProductId: String
    $bonusCount: Float
    $coupon: String
    $spinCampaignId: String
    $spinCount: Float
    $lotteryCampaignId: String
    $lotteryCount: Float
    $kind: Kind
    $value: Float
    $restrictions: JSON
  ) {
    voucherCampaignsEdit(
      _id: $_id
      title: $title
      description: $description
      startDate: $startDate
      endDate: $endDate
      finishDateOfUse: $finishDateOfUse
      attachment: $attachment
      status: $status
      buyScore: $buyScore
      score: $score
      scoreAction: $scoreAction
      voucherType: $voucherType
      productCategoryIds: $productCategoryIds
      productIds: $productIds
      discountPercent: $discountPercent
      bonusProductId: $bonusProductId
      bonusCount: $bonusCount
      coupon: $coupon
      spinCampaignId: $spinCampaignId
      spinCount: $spinCount
      lotteryCampaignId: $lotteryCampaignId
      lotteryCount: $lotteryCount
      kind: $kind
      value: $value
      restrictions: $restrictions
    ) {
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
