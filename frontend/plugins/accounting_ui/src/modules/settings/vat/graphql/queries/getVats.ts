import { gql } from '@apollo/client';

export const vatRowFields = `
  _id
  name
  number
  kind
  formula
  formulaText
  tabCount
  isBold
  status
  percent
`;

export const GET_VATS = gql`
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

export const SELECT_VATS = gql`
  query SelectVats(
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
      _id
      name
      number
      percent
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

export const GET_VAT_VALUE = gql`
  query VatRowDetail($id: String) {
    vatRowDetail(_id: $id) {
      _id
      name
      number
      percent
    }
  }
`;
