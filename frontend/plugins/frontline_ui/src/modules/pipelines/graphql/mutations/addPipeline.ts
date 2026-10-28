import { gql } from '~/gql';

export const ADD_PIPELINE = gql(`
  mutation CreatePipeline(
    $name: String!
    $channelId: String!
    $description: String
    $order: Int
    $excludeCheckUserIds: [String]
    $isCheckDate: Boolean
    $isCheckUser: Boolean
    $isCheckEntity: Boolean
    $isHideName: Boolean
    $sharedEntityIds: [String]
    $numberConfig: String
    $numberSize: String
    $nameConfig: String
    $visibility: String
    $memberIds: [String]
  ) {
    createPipeline(
      name: $name
      channelId: $channelId
      description: $description
      order: $order
      excludeCheckUserIds: $excludeCheckUserIds
      isCheckDate: $isCheckDate
      isCheckUser: $isCheckUser
      isCheckEntity: $isCheckEntity
      isHideName: $isHideName
      sharedEntityIds: $sharedEntityIds
      numberConfig: $numberConfig
      numberSize: $numberSize
      nameConfig: $nameConfig
      visibility: $visibility
      memberIds: $memberIds
    ) {
      _id
      channelId
      createdAt
      description
      name
      updatedAt
      userId
    }
  }
`);
