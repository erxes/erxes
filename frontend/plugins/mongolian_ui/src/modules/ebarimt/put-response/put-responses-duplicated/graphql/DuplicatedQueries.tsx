import { gql } from '~/gql';

const putResponsesDuplicated = gql(`
  query ebarimtPutResponsesDuplicated(
    $billType: String
    $startDate: Date
    $endDate: Date
    $page: Int
    $perPage: Int
  ) {
    putResponsesDuplicated(
      billType: $billType
      startDate: $startDate
      endDate: $endDate
      page: $page
      perPage: $perPage
    ) {
      list {
        _id
        date
        values {
          counter
          cityTax
          vat
          amount
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`);

export const duplicatedQueries = {
  putResponsesDuplicated,
};
