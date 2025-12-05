import { gql } from '@apollo/client';

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
  type
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

const commonParamDefs = `
  $page: Int,
  $perPage: Int
`;

const commonParams = `
  page: $page,
  perPage: $perPage
`;

const posList = gql`
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

const productGroups = gql`
  query productGroups($posId: String!) {
    productGroups(posId: $posId) {
      _id
      posId
      name
      description
      categoryIds
      excludedCategoryIds
      excludedProductIds
    }
  }
`;

const posSlots = gql`
  query posSlots($posId: String!) {
    posSlots(posId: $posId) {
      _id
      posId
      code
      name
      option
    }
  }
`;

const posDetail = gql`
  query posDetail($_id: String!) {
    posDetail(_id: $_id) {
      ${posCommonFields}
      productDetails
    }
  }
`;

const getDbSchemaLabels = gql`
  query getDbSchemaLabels($type: String) {
    getDbSchemaLabels(type: $type) {
      name
      label
    }
  }
`;

const posEnv = gql`
  query posEnv {
    posEnv
  }
`;

const posOrdersSummary = gql`
  query PosOrdersSummary($customerId: String) {
    posOrdersSummary(customerId: $customerId)
  }
`;

const getPayments = gql`
  query Payments($status: String, $kind: String) {
    payments(status: $status, kind: $kind) {
      _id
      name
      kind
      status
      config
      createdAt
    }
  }
`;

const ebarimtProductRules = gql`
  query EbarimtProductRules($searchValue: String, $kind: String) {
    ebarimtProductRules(searchValue: $searchValue, kind: $kind) {
      totalCount
      list {
        _id
        title
      }
    }
  }
`;

const fieldsCombinedByContentType = gql`
  query FieldsCombinedByContentType(
    $contentType: String!
    $usageType: String
    $excludedNames: [String]
    $segmentId: String
    $config: JSON
    $onlyDates: Boolean
  ) {
    fieldsCombinedByContentType(
      contentType: $contentType
      usageType: $usageType
      excludedNames: $excludedNames
      segmentId: $segmentId
      config: $config
      onlyDates: $onlyDates
    )
  }
`;

export default {
  posList,
  productGroups,
  posDetail,
  posEnv,
  getDbSchemaLabels,
  posSlots,
  posOrdersSummary,
  getPayments,
  ebarimtProductRules,
  fieldsCombinedByContentType,
};
