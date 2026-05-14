import { gql } from '@apollo/client';

const GET_RESPONSES = gql`
  query ResponseTemplates($filter: ResponseTemplatesFilter) {
    responseTemplates(filter: $filter) {
      list {
        _id
        name
        content
        channelId
        createdAt
        updatedAt
        files
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

export { GET_RESPONSES };
