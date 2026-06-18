import { gql } from '@apollo/client';

export const CREATE_LOYALTY_SCORE = gql`
  mutation CreateScoreCampaign(
    $title: String
    $description: String
    $order: Int
    $add: JSON
    $subtract: JSON
    $set: JSON
    $createdAt: Date
    $createdUserId: String
    $status: String
    $ownerType: String
    $fieldGroupId: String
    $fieldName: String
    $fieldId: String
    $fieldOrigin: String
    $serviceName: String
    $additionalConfig: JSON
    $restrictions: JSON
    $onlyClientPortal: Boolean
  ) {
    scoreCampaignAdd(
      title: $title
      description: $description
      order: $order
      add: $add
      subtract: $subtract
      set: $set
      createdAt: $createdAt
      createdUserId: $createdUserId
      status: $status
      ownerType: $ownerType
      fieldGroupId: $fieldGroupId
      fieldName: $fieldName
      fieldId: $fieldId
      fieldOrigin: $fieldOrigin
      serviceName: $serviceName
      additionalConfig: $additionalConfig
      restrictions: $restrictions
      onlyClientPortal: $onlyClientPortal
    )
  }
`;
