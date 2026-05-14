import { gql } from '@apollo/client';

export const GET_SALES_PIPELINES = gql`
  query SalesPipelines($boardId: String) {
    salesPipelines(boardId: $boardId) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      list {
        _id
        name
        boardId
        startDate
        endDate
        itemsTotalCount
        state
        type
      }
      totalCount
    }
  }
`;
