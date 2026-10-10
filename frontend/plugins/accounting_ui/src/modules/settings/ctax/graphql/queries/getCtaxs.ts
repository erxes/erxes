import { gql } from '~/gql';

export const GET_CTAXS = gql(`
query accountingCtaxRows($status: String, $name: String, $number: String, $searchValue: String, $ids: [String], $excludeIds: Boolean, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
  ctaxRows(
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
    status
    percent
  }
  ctaxRowsCount(
    status: $status
    name: $name
    number: $number
    searchValue: $searchValue
    ids: $ids
    excludeIds: $excludeIds
  )
}
`);

export const SELECT_CTAXS = gql(`
query accountingSelectCtaxs($status: String, $name: String, $number: String, $searchValue: String, $ids: [String], $excludeIds: Boolean, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
  ctaxRows(
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
  }
  ctaxRowsCount(
    status: $status
    name: $name
    number: $number
    searchValue: $searchValue
    ids: $ids
    excludeIds: $excludeIds
  )
}
`);

export const GET_CTAX_VALUE = gql(`
query accountingCtaxRowDetail($id: String!) {
  ctaxRowDetail(_id: $id) {
    _id
    name
    number
    percent
  }
}
`);
