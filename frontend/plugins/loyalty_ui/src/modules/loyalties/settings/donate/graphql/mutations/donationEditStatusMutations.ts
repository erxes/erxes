import { gql } from '@apollo/client';

export const UPDATE_DONATE_CAMPAIGN = gql`
  mutation UpdateDonateCampaign(
    $_id: String!
    $title: String
    $description: String
    $startDate: Date
    $endDate: Date
    $finishDateOfUse: Date
    $attachment: AttachmentInput
    $status: String
    $maxScore: Float
    $awards: JSON
  ) {
    donateCampaignsEdit(
      _id: $_id
      title: $title
      description: $description
      startDate: $startDate
      endDate: $endDate
      finishDateOfUse: $finishDateOfUse
      attachment: $attachment
      status: $status
      maxScore: $maxScore
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
      maxScore
      awards
      donatesCount
    }
  }
`;
