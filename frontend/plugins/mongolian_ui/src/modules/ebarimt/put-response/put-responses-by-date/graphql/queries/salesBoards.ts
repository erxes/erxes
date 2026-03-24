import { gql } from '@apollo/client';

export const GET_SALES_BOARDS = gql`
  query SalesBoards {
    salesBoards {
      _id
      name
      order
      createdAt
      type
      pipelines {
        _id
        name
        type
      }
    }
  }
`;
