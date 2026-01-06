import { gql } from '@apollo/client';

export const adjustClosingFields = `
    _id
    createdAt
    createdBy
    updatedAt
    modifiedBy

    status
    date
    beginDate
    description
    integrateAccountId
    periodGLAccountId
    earningAccountId
    taxPayableaccountId
`;

export const adjustClosingDetailFields = `
    _id
    createdAt
    updatedAt

    branchId
    departmentid
    entries
    closeIntegrateTrId
    periodGLTrId
`;

export const ADJUST_CLOSING_QUERY = gql`
  query AdjustClosing(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    adjustClosingEntries(
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
    adjustClosingEntriesCount(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    )
  }
`;
