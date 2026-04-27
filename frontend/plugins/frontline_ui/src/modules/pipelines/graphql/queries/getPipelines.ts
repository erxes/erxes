import { gql } from '@apollo/client';

export const GET_TICKET_PIPELINES = gql`
  query GetTicketPipelines($filter: TicketsPipelineFilter) {
    getTicketPipelines(filter: $filter) {
      list {
        _id
        channelId
        createdAt
        description
        name
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
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;
