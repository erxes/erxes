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
    $numberConfig: String
    $numberSize: String
    $nameConfig: String
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
      numberConfig: $numberConfig
      numberSize: $numberSize
      nameConfig: $nameConfig
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
      numberConfig
      numberSize
      nameConfig
    }
  }
`;
