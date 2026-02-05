import { gql } from '@apollo/client';

export const CREATE_SPIN_CAMPAIGN = gql`
  mutation CreateSpinCampaign(
    $title: String
    $description: String
    $startDate: Date
    $endDate: Date
    $finishDateOfUse: Date
    $attachment: AttachmentInput
    $status: String
    $buyScore: Float
    $awards: JSON
  ) {
    spinCampaignsAdd(
      title: $title
      description: $description
      startDate: $startDate
      endDate: $endDate
      finishDateOfUse: $finishDateOfUse
      attachment: $attachment
      status: $status
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
      buyScore
      awards
      spinsCount
    }
  }
`;
