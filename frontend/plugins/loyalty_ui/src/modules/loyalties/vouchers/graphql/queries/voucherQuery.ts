import { gql } from '@apollo/client';
const commonParamDefs = `
  $page: Int,
  $perPage: Int
`;
const commonParams = `
  page: $page,
  perPage: $perPage
`;
export const voucherCommonFields = `
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
  ebarimtConfig
  erkhetConfig
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
  checkRemainder
  permissionConfig
  allowTypes
  isCheckRemainder
  checkExcludeCategoryIds
  banFractions
  branchTitle
  departmentTitle
`;
export const VOUCHER_QUERY = gql`
query voucherList(
  ${commonParamDefs}
  $sortField: String
  $sortDirection: Int
) {
  voucherList(
    ${commonParams}
    sortField: $sortField
    sortDirection: $sortDirection
  ) {
    ${voucherCommonFields}
  }
}
`;
