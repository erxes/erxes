import { gql } from '@apollo/client';

export const adjustInventoryFields = `
  _id
  createdAt
  createdBy
  updatedAt
  modifiedBy

  date
  description
  status
  error
  warning
  beginDate
  successDate
  checkedAt
`;

export const adjustInvDetailFields = `
  _id
  adjustId
  createdAt
  updatedAt

  productId
  accountId
  departmentId
  branchId

  remainder
  cost
  unitCost
  soonInCount
  soonOutCount

  error
  warning
  byDate

  account {
    _id
    code
    name
    currency
    kind
    journal
  }
  branch {
    _id
    code
    title
  }
  department {
    _id
    code
    title
  }
  product {
    _id
    code
    name
  }
`;

const adjustInvFilterParamDefs = `
  $startDate: Date
  $endDate: Date
  $description: String
  $status: String
  $error: String
  $warning: String
  $startBeginDate: Date
  $endBeginDate: Date
  $startSuccessDate: Date
  $endSuccessDate: Date
  $startCheckedAt: Date
  $endCheckedAt: Date
`;

const adjustInvFilterParams = `
  startDate: $startDate
  endDate: $endDate
  description: $description
  status: $status
  error: $error
  warning: $warning
  startBeginDate: $startBeginDate
  endBeginDate: $endBeginDate
  startSuccessDate: $startSuccessDate
  endSuccessDate: $endSuccessDate
  startCheckedAt: $startCheckedAt
  endCheckedAt: $endCheckedAt
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

export const ADJUST_INVENTORIES_QUERY = gql`
  query AdjustInventories(${adjustInvFilterParamDefs}, ${commonParamDefs}) {
    adjustInventories(${adjustInvFilterParams}, ${commonParams}) {
      ${adjustInventoryFields}
    }
    adjustInventoriesCount(${adjustInvFilterParams})
  }
`
export const ADJUST_INVENTORY_DETAIL_QUERY = gql`
  query AdjustInventoryDetail($_id: String!) {
    adjustInventoryDetail(_id: $_id) {
      ${adjustInventoryFields}
    }
  }
`;

export const ADJUST_INVENTORY_DETAILS_QUERY = gql`
  query AdjustInventoryDetails($_id: String!) {
    adjustInventoryDetails(_id: $_id) {
      ${adjustInvDetailFields}
    }
    adjustInventoryDetailsCount(_id: $_id)
  }
`;
