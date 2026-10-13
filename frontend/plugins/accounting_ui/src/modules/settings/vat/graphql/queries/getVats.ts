import { gql } from '~/gql';

export const GET_VATS = gql(`
query accountingVatRows($status: String, $name: String, $number: String, $searchValue: String, $ids: [String], $excludeIds: Boolean, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
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
    kind
    formula
    formulaText
    tabCount
    isBold
    status
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
`);

export const SELECT_VATS = gql(`
query accountingSelectVats($status: String, $name: String, $number: String, $searchValue: String, $ids: [String], $excludeIds: Boolean, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
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
`);

export const GET_VAT_VALUE = gql(`
query accountingVatRowDetail($id: String!) {
  vatRowDetail(_id: $id) {
    _id
    name
    number
    percent
  }
}
`);
