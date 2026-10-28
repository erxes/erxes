import { gql } from '~/gql';

export const UPDATE_PIPELINE = gql(`
  mutation UpdatePipeline(
    $_id: String!
    $description: String
    $name: String
    $order: Int
    $excludeCheckUserIds: [String]
    $isCheckDate: Boolean
    $isCheckUser: Boolean
    $isCheckEntity: Boolean
    $visibility: String
    $memberIds: [String]
    $sharedEntityIds: [String]
    $numberConfig: String
    $numberSize: String
    $nameConfig: String
    $createLayout: [[String!]!]
  ) {
    updatePipeline(
      _id: $_id
      description: $description
      name: $name
      order: $order
      excludeCheckUserIds: $excludeCheckUserIds
      isCheckDate: $isCheckDate
      isCheckUser: $isCheckUser
      isCheckEntity: $isCheckEntity
      visibility: $visibility
      memberIds: $memberIds
      sharedEntityIds: $sharedEntityIds
      numberConfig: $numberConfig
      numberSize: $numberSize
      nameConfig: $nameConfig
      createLayout: $createLayout
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
      isCheckUser
      isCheckEntity
      visibility
      memberIds
      sharedEntityIds
      numberConfig
      numberSize
      nameConfig
      createLayout
    }
  }
`);
