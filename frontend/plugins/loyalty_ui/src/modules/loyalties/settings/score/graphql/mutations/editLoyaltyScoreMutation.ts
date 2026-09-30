import { gql } from '@apollo/client';

export const UPDATE_SCORE_CAMPAIGN = gql`
  mutation updateScoreCampaign(
    $_id: String
    $title: String
    $description: String
    $order: Int
    $add: JSON
    $subtract: JSON
    $createdAt: Date
    $createdUserId: String
    $status: String
    $accountTypeId: String
    $serviceName: String
    $additionalConfig: JSON
    $restrictions: JSON
  ) {
    scoreCampaignUpdate(
      _id: $_id
      title: $title
      description: $description
      order: $order
      add: $add
      subtract: $subtract
      createdAt: $createdAt
      createdUserId: $createdUserId
      status: $status
      accountTypeId: $accountTypeId
      serviceName: $serviceName
      additionalConfig: $additionalConfig
      restrictions: $restrictions
    ) {
      _id
      title
      description
      order
      add
      subtract
      createdAt
      createdUserId
      status
      ownerType
      accountTypeId
      fieldId
      serviceName
      additionalConfig
      restrictions
    }
  }
`;
