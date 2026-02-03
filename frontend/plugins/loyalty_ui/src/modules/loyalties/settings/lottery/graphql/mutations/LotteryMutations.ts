import { gql } from '@apollo/client';

export const CREATE_LOTTERY_CAMPAIGN = gql`
  mutation CreateLotteryCampaign(
    $title: String
    $description: String
    $startDate: Date
    $endDate: Date
    $finishDateOfUse: Date
    $attachment: AttachmentInput
    $status: String
    $numberFormat: String
    $buyScore: Float
    $awards: JSON
  ) {
    lotteryCampaignsAdd(
      title: $title
      description: $description
      startDate: $startDate
      endDate: $endDate
      finishDateOfUse: $finishDateOfUse
      attachment: $attachment
      status: $status
      numberFormat: $numberFormat
      buyScore: $buyScore
      awards: $awards
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
      numberFormat
      buyScore
      awards
      lotteriesCount
    }
  }
`;
