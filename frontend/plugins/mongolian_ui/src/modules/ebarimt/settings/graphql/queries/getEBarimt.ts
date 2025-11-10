import { gql } from '@apollo/client';
export const vatRowFields = `
  _id
  title
  taxType
  taxCode
  percent
  kind
  tabCount
  isBold
  status
`;

export const GET_EBARIMTS = gql`
  query vatRows(
    $status: String
    $name: String
    $number: String
    $searchValue: String
    $ids: [String]
    $excludeIds: Boolean
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    vatRows(
      status: $status
      name: $name
      number: $number
      searchValue: $searchValue
      ids: $ids
      excludeIds: $excludeIds
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      ${vatRowFields}
    }
    vatRowsCount(
      status: $status
      name: $name
      number: $number
      searchValue: $searchValue
      ids: $ids
      excludeIds: $excludeIds
    )
  }
`;
