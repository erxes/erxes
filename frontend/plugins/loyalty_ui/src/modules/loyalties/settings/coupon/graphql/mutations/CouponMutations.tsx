import { gql } from '@apollo/client';

export const CREATE_COUPON_CAMPAIGN = gql`
  mutation CreateCouponCampaign(
    $title: String
    $description: String
    $startDate: Date
    $endDate: Date
    $finishDateOfUse: Date
    $numberFormat: String
    $attachment: AttachmentInput
    $status: String
    $kind: Kind
    $value: Float
    $codeRule: JSON
    $restrictions: JSON
    $redemptionLimitPerUser: Int
    $buyScore: Int
    $charSet: [String]
  ) {
    couponCampaignAdd(
      title: $title
      description: $description
      startDate: $startDate
      endDate: $endDate
      finishDateOfUse: $finishDateOfUse
      numberFormat: $numberFormat
      attachment: $attachment
      status: $status
      kind: $kind
      value: $value
      codeRule: $codeRule
      restrictions: $restrictions
      redemptionLimitPerUser: $redemptionLimitPerUser
      buyScore: $buyScore
      charSet: $charSet
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
        type
        size
        duration
        __typename
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
