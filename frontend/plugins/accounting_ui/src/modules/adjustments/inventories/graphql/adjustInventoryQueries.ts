import { gql } from '~/gql';

export const ADJUST_INVENTORIES_QUERY = gql(`
query accountingAdjustInventories($startDate: Date, $endDate: Date, $description: String, $status: String, $error: String, $warning: String, $startBeginDate: Date, $endBeginDate: Date, $startSuccessDate: Date, $endSuccessDate: Date, $startCheckedAt: Date, $endCheckedAt: Date, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
  adjustInventories(
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
    page: $page
    perPage: $perPage
    sortField: $sortField
    sortDirection: $sortDirection
  ) {
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
  }
  adjustInventoriesCount(
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
  )
}
`);
export const ADJUST_INVENTORY_DETAIL_QUERY = gql(`
query accountingAdjustInventoryDetail($_id: String!) {
  adjustInventoryDetail(_id: $_id) {
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
  }
}
`);

export const ADJUST_INVENTORY_DETAILS_QUERY = gql(`
query accountingAdjustInventoryDetails($_id: String!, $page: Int, $perPage: Int) {
  adjustInventoryDetails(_id: $_id, page: $page, perPage: $perPage) {
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
  }
  adjustInventoryDetailsCount(_id: $_id)
}
`);
