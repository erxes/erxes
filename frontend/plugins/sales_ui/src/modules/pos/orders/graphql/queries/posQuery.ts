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
  orderPassword
  scopeBrandIds
  pdomain
  createdAt
  token
  erxesAppToken
  adminIds
  cashierIds
  paymentIds
  paymentTypes
  user {
    _id
    details {
      avatar
      fullName
    }
  }

  isOnline
  onServer
  branchId
  departmentId
  allowBranchIds
  beginNumber
  maxSkipNumber
  waitingScreen
  kitchenScreen
  kioskMachine
  uiOptions
  cardsConfig
  catProdMappings {
    _id
    categoryId
    code
    name
    productId
  }

  initialCategoryIds
  kioskExcludeCategoryIds
  kioskExcludeProductIds
  deliveryConfig
  permissionConfig
  allowTypes
  isCheckRemainder
  checkExcludeCategoryIds
  saveRemainder
  banFractions
  branchTitle
  departmentTitle
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
