import { gql } from '@apollo/client';

export const GET_PIPELINE = gql`
  query GetTicketPipeline($id: String!) {
    getTicketPipeline(_id: $id) {
      _id
      name
      channelId
      pipelineId
      description
      userId
      createdAt
      updatedAt
      state
      isCheckDate
      isCheckUser
      isCheckDepartment
      isCheckBranch
      isHideName
      excludeCheckUserIds
      numberConfig
      numberSize
      nameConfig
      lastNum
      departmentIds
      branchIds
      tagId
      createdUser {
        _id
        details {
          avatar
          fullName
          __typename
        }
        __typename
      }
      __typename
      memberIds
      visibility
    }
  }
`;
