import { gql } from '~/gql';

export const ADJUST_CLOSING_QUERY = gql(`
query accountingAdjustClosings($page: Int, $perPage: Int, $sortField: String, $sortDirection: Int, $status: String) {
  adjustClosings(
    page: $page
    perPage: $perPage
    sortField: $sortField
    sortDirection: $sortDirection
    status: $status
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
  adjustClosingsCount(status: $status)
}
`);
