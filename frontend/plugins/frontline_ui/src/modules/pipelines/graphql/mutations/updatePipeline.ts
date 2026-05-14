import { gql } from '@apollo/client';

export const UPDATE_PIPELINE = gql`
  mutation UpdatePipeline(
    $_id: String!
    $description: String
    $name: String
    $order: Int
    $excludeCheckUserIds: [String]
    $isCheckDate: Boolean
    $isCheckBranch: Boolean
    $isCheckUser: Boolean
    $isCheckDepartment: Boolean
    $visibility: String
    $memberIds: [String]
  ) {
    updatePipeline(
      _id: $_id
      description: $description
      name: $name
      order: $order
      excludeCheckUserIds: $excludeCheckUserIds
      isCheckDate: $isCheckDate
      isCheckBranch: $isCheckBranch
      isCheckUser: $isCheckUser
      isCheckDepartment: $isCheckDepartment
      visibility: $visibility
      memberIds: $memberIds
    ) {
      _id
      name
      channelId
      description
      userId
      createdAt
      updatedAt
      pipelineId
      excludeCheckUserIds
      isCheckDate
      isCheckBranch
      isCheckUser
      isCheckDepartment
      visibility
      memberIds
    }
  }
`;
