import { gql } from '~/gql';

const posList = gql(`
  query salesPosSettingsList(
    $page: Int
    $perPage: Int
    $sortField: String
    $sortDirection: Int
  ) {
    posList(
      page: $page
      perPage: $perPage
      sortField: $sortField
      sortDirection: $sortDirection
    ) {
      _id
      name
      description
      orderPassword
      scopeBrandIds
      pdomain
      createdAt
      token
      serviceCharge
      serviceChargeApplicableProductId
      adminIds
      cashierIds
      paymentIds
      paymentTypes
      earnScoreCampaignId
      earnTier
      acceptCoupons
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
      customerCreateConfig
      allowTypes
      isShowRemainder
      isCheckRemainder
      checkExcludeCategoryIds
      saveRemainder
      banFractions
      branchTitle
      departmentTitle
    }
  }
`);

const productGroups = gql(`
  query productGroups($posId: String!) {
    productGroups(posId: $posId) {
      _id
      posId
      categoryIds
      excludedCategoryIds
      excludedProductIds
    }
  }
`);

const posSlots = gql(`
  query posSlots($posId: String!) {
    posSlots(posId: $posId) {
      _id
      posId
      code
      name
      option
    }
  }
`);

const posDetail = gql(`
  query salesPosSettingsDetail($_id: String!) {
    posDetail(_id: $_id) {
      _id
      name
      description
      orderPassword
      scopeBrandIds
      pdomain
      createdAt
      token
      serviceCharge
      serviceChargeApplicableProductId
      adminIds
      cashierIds
      paymentIds
      paymentTypes
      earnScoreCampaignId
      earnTier
      acceptCoupons
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
      customerCreateConfig
      allowTypes
      isShowRemainder
      isCheckRemainder
      checkExcludeCategoryIds
      saveRemainder
      banFractions
      branchTitle
      departmentTitle
      productDetails
    }
  }
`);

const posEnv = gql(`
  query posEnv {
    posEnv
  }
`);

const posOrdersSummary = gql(`
  query salesPosCustomerOrdersSummary($customerId: String) {
    posOrdersSummary(customerId: $customerId)
  }
`);

const ebarimtProductRules = gql(`
  query EbarimtProductRules($searchValue: String, $kind: String) {
    ebarimtProductRules(searchValue: $searchValue, kind: $kind) {
      totalCount
      list {
        _id
        title
      }
    }
  }
`);

const fieldsCombinedByContentType = gql(`
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
`);

const ProductCategories = gql(`
  query salesPosSettingsProductCategories {
    productCategories {
      _id
      parentId
      code
      name
      order
      productCount
    }
  }
`);

export const queries = {
  posList,
  productGroups,
  posDetail,
  posEnv,
  posSlots,
  posOrdersSummary,
  ebarimtProductRules,
  fieldsCombinedByContentType,
  ProductCategories,
};
