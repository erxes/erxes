import { gql } from '~/gql';

export const GET_TICKET_PIPELINES = gql(`
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
        isCheckEntity
        isHideName
        excludeCheckUserIds
        numberConfig
        numberSize
        nameConfig
        lastNum
        sharedEntityIds
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
`);
