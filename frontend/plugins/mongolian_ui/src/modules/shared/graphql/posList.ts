import { gql } from '~/gql';

export const GET_POS_LIST = gql(`
  query mongolianPosList(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
    $search: String
  ) {
    posList(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
      search: $search
    ) {
      _id
      name
      description
      pdomain
      createdAt
      token
      adminIds
      cashierIds
      isOnline
      onServer
      branchId
      departmentId
      allowBranchIds
      beginNumber
      paymentIds
      paymentTypes
    }
  }
`);
