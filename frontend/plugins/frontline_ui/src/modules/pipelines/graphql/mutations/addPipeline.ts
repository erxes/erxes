import { gql } from '@apollo/client';

export const ADD_PIPELINE = gql`
  mutation CreatePipeline(
    $name: String!
    $channelId: String!
    $description: String
    $order: Int
    $excludeCheckUserIds: [String]
    $isCheckDate: Boolean
    $isCheckUser: Boolean
    $isCheckDepartment: Boolean
    $isCheckBranch: Boolean
    $isHideName: Boolean
    $departmentIds: [String]
    $branchIds: [String]
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
      isCheckDepartment: $isCheckDepartment
      isCheckBranch: $isCheckBranch
      isHideName: $isHideName
      departmentIds: $departmentIds
      branchIds: $branchIds
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
`;
