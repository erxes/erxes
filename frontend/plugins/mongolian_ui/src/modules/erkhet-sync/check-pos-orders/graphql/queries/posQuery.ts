import { gql } from '@apollo/client';
const commonParamDefs = `
  $page: Int,
  $perPage: Int
`;
const commonParams = `
  page: $page,
  perPage: $perPage
`;
export const posCommonFields = `
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
`;
export const POS_QUERY = gql`
query posList(
  ${commonParamDefs}
  $sortField: String
  $sortDirection: Int
) {
  posList(
    ${commonParams}
    sortField: $sortField
    sortDirection: $sortDirection
  ) {
    ${posCommonFields}
  }
}
`;
