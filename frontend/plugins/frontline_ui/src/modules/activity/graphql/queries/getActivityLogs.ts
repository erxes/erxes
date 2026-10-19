import { gql } from '~/gql';

export const GET_ACTIVITIES = gql(`
  query getTicketActivities(
    $contentId: String!
    $cursor: String
    $cursorMode: CURSOR_MODE
    $direction: CURSOR_DIRECTION
    $limit: Int
  ) {
    getTicketActivities(
      contentId: $contentId
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
    ) {
      list {
        _id
        module
        action
        contentId
        metadata {
          newValue
          previousValue
          conversationId
          ticketId
          formId
          formTitle
          submissions {
            label
            value
          }
        }
        createdBy
        createdAt
        updatedAt
      }
      totalCount
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
