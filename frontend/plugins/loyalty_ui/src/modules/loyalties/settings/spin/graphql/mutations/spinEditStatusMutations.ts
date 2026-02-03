import { gql } from '@apollo/client';

export const UPDATE_SPIN_CAMPAIGN = gql`
  mutation UpdateSpinCampaign(
    $id: String!
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
    spinCampaignsEdit(
      _id: $id
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
