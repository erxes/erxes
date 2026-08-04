import { gql } from '@apollo/client';

export const adjustFixedAssetFields = `
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

export const adjustFxaDetailFields = `
  _id
  adjustId
  fxaInstanceId
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
`;

const adjustFixedAssetFilterParamDefs = `
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

const adjustFixedAssetFilterParams = `
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
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
`;

const commonParams = `
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
`;

export const ADJUST_FIXED_ASSETS_QUERY = gql`
  query AdjustFixedAssets(
    ${adjustFixedAssetFilterParamDefs}
    ${commonParamDefs}
  ) {
    adjustFixedAssets(
      ${adjustFixedAssetFilterParams}
      ${commonParams}
    ) {
      ${adjustFixedAssetFields}
    }
    adjustFixedAssetsCount(${adjustFixedAssetFilterParams})
  }
`;

export const ADJUST_FIXED_ASSET_DETAIL_QUERY = gql`
  query AdjustFixedAssetDetail($_id: String!) {
    adjustFixedAssetDetail(_id: $_id) {
      ${adjustFixedAssetFields}
    }
  }
`;

export const ADJUST_FXA_DETAILS_QUERY = gql`
  query AdjustFxaDetails(
    $_id: String!
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    adjustFxaDetails(
      _id: $_id
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      ${adjustFxaDetailFields}
    }
    adjustFxaDetailsCount(_id: $_id)
  }
`;
