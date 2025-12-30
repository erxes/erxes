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

const adjustClosingFilterParamsDefs = `
    $status: String
    $date: Date
    $beginDate: Date
    $description: String
    $integrateAccountId: String
    $periodGLAccountId: String
    $earningAccountId: String
    $taxPayableAccountId: String
`;

const adjustClosingFilterParams = `
    status: $status
    date: $date
    beginDate: $beginDate
    description: $description
    integrateAccountId: $integrateAccountId
    periodGLAccountId: $periodGLAccountId
    earningAccountId: $earningAccountId
    taxPayableAccountId: $taxPayableAccountId
`;

const commonParamDefs = `
  $page: Int,
  $perPage: Int,
  $sortField: String,
  $sortDirection: Int
`;

const commonParams = `
  page: $page,
  perPage: $perPage
  sortField: $sortField,
  sortDirection: $sortDirection
`;

export const ADJUST_CLOSING_QUERY = gql`
    query AdjustClosing(${adjustClosingFilterParamsDefs}, ${commonParamDefs}) {
        adjustClosing(${adjustClosingFilterParams}, ${commonParams}) {
            ${adjustClosingFields}
        }
        adjustClosingCount(${adjustClosingFilterParams})
    }
`;
