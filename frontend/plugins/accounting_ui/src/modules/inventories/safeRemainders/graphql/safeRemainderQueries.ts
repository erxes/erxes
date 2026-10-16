import { gql } from '~/gql';

export const SAFE_REMAINDERS_QUERY = gql(`
query accountingSafeRemainders($searchValue: String, $departmentId: String, $branchId: String, $beginDate: Date, $endDate: Date, $productId: String, $createdUserId: String, $modifiedUserId: String, $createdStartDate: Date, $createdEndDate: Date, $updatedStartDate: Date, $updatedEndDate: Date, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
  safeRemainders(
    searchValue: $searchValue
    departmentId: $departmentId
    branchId: $branchId
    beginDate: $beginDate
    endDate: $endDate
    productId: $productId
    createdUserId: $createdUserId
    modifiedUserId: $modifiedUserId
    createdStartDate: $createdStartDate
    createdEndDate: $createdEndDate
    updatedStartDate: $updatedStartDate
    updatedEndDate: $updatedEndDate
    page: $page
    perPage: $perPage
    sortField: $sortField
    sortDirection: $sortDirection
  ) {
    remainders {
      _id
      createdAt
      createdBy
      modifiedAt
      modifiedBy
      date
      description
      status
      branchId
      departmentId
      productCategoryId
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
      productCategory {
        _id
        code
        name
      }
      modifiedUser {
        _id
        details {
          avatar
          fullName
        }
      }
      incomeRule
      incomeTrId
      outRule
      outTrId
      saleRule
      saleTrId
      costIncreaseRule
      costDecreaseRule
      costIncreaseTrId
      costDecreaseTrId
    }
    totalCount
  }
}
`);
export const SAFE_REMAINDER_DETAIL_QUERY = gql(`
query accountingSafeRemainderDetail($_id: String!) {
  safeRemainderDetail(_id: $_id) {
    _id
    createdAt
    createdBy
    modifiedAt
    modifiedBy
    date
    description
    status
    branchId
    departmentId
    productCategoryId
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
    productCategory {
      _id
      code
      name
    }
    modifiedUser {
      _id
      details {
        avatar
        fullName
      }
    }
    incomeRule
    incomeTrId
    outRule
    outTrId
    saleRule
    saleTrId
    costIncreaseRule
    costDecreaseRule
    costIncreaseTrId
    costDecreaseTrId
  }
}
`);

export const SAFE_REMAINDER_DETAILS_QUERY = gql(`
query accountingSafeRemainderItems($remainderId: String!, $status: String, $productCategoryIds: [String], $diffType: String, $searchValue: String, $page: Int, $perPage: Int) {
  safeRemainderItems(
    remainderId: $remainderId
    status: $status
    productCategoryIds: $productCategoryIds
    diffType: $diffType
    searchValue: $searchValue
    page: $page
    perPage: $perPage
  ) {
    _id
    branchId
    departmentId
    preCount
    count
    status
    remainderId
    createdAt
    createdBy
    modifiedAt
    modifiedBy
    order
    product {
      _id
      code
      name
    }
    productId
    uom
    trInfo {
      activeCost
      unitCost
      isCostExplicit
      lastIncomePrice
      isSale
      unitPrice
    }
  }
  safeRemainderItemsCount(
    remainderId: $remainderId
    status: $status
    productCategoryIds: $productCategoryIds
    diffType: $diffType
    searchValue: $searchValue
  )
}
`);
