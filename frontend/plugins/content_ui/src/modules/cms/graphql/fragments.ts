import { gql } from '@apollo/client';

export const PageInfoFragment = gql`
  fragment PageInfo on PageInfo {
    hasNextPage
    hasPreviousPage
    startCursor
    endCursor
  }
`;
