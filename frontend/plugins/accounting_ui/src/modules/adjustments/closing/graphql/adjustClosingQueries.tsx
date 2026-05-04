import { gql } from '@apollo/client';

export const ADJUST_CLOSING_QUERY = gql`
  query AdjustClosings(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    adjustClosings(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      _id
      description
      status
      date
      beginDate
      integrateAccountId
      periodGLAccountId
      earningAccountId
      taxPayableAccountId
      createdAt
      updatedAt
    }

    adjustClosingsCount
  }
`;
