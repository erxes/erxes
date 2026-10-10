import { gql } from '~/gql';

export const ADJUST_FIXED_ASSETS_QUERY = gql(`
query accountingAdjustFixedAssets($startDate: Date, $endDate: Date, $description: String, $status: String, $error: String, $warning: String, $startBeginDate: Date, $endBeginDate: Date, $startSuccessDate: Date, $endSuccessDate: Date, $startCheckedAt: Date, $endCheckedAt: Date, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
  adjustFixedAssets(
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
  adjustFixedAssetsCount(
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

export const ADJUST_FIXED_ASSET_DETAIL_QUERY = gql(`
query accountingAdjustFixedAssetDetail($_id: String!) {
  adjustFixedAssetDetail(_id: $_id) {
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

export const ADJUST_FXA_DETAILS_QUERY = gql(`
query accountingAdjustFxaDetails($_id: String!, $page: Int, $perPage: Int, $sortField: String, $sortDirection: Int) {
  adjustFxaDetails(
    _id: $_id
    page: $page
    perPage: $perPage
    sortField: $sortField
    sortDirection: $sortDirection
  ) {
    _id
    adjustId
    fixedAssetId
    categoryId
    accountId
    branchId
    departmentId
    originalCost
    salvageValue
    openingBookValue
    openingAccumulatedDepreciation
    depreciationAmount
    bookDepreciationAmount
    closingAccumulatedDepreciation
    closingBookValue
    transactionId
    transactionDetailId
    error
    warning
    account {
      _id
      code
      name
    }
    fixedAsset {
      _id
      code
      name
    }
  }
  adjustFxaDetailsCount(_id: $_id)
}
`);
