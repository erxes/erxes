import { gql } from '~/gql';

const posAdd = gql(`
  mutation PosAdd(
    $name: String
    $description: String
    $branchId: String
    $paymentIds: [String]
    $adminIds: [String]
    $cashierIds: [String]
    $initialCategoryIds: [String]
  ) {
    posAdd(
      name: $name
      description: $description
      branchId: $branchId
      paymentIds: $paymentIds
      adminIds: $adminIds
      cashierIds: $cashierIds
      initialCategoryIds: $initialCategoryIds
    ) {
      _id
    }
  }
`);

const posEdit = gql(`
  mutation posEdit(
    $_id: String!
    $name: String
    $description: String
    $orderPassword: String
    $scopeBrandIds: [String]
    $pdomain: String
    $serviceCharge: Float
    $serviceChargeApplicableProductId: String
    $productDetails: [String]
    $adminIds: [String]
    $cashierIds: [String]
    $paymentIds: [String]
    $paymentTypes: [JSON]
    $earnScoreCampaignId: String
    $earnTier: JSON
    $acceptCoupons: Boolean
    $isOnline: Boolean
    $onServer: Boolean
    $branchId: String
    $departmentId: String
    $allowBranchIds: [String]
    $beginNumber: String
    $maxSkipNumber: Int
    $kitchenScreen: JSON
    $waitingScreen: JSON
    $kioskMachine: JSON
    $uiOptions: JSON
    $cardsConfig: JSON
    $catProdMappings: [CatProdInput]
    $initialCategoryIds: [String]
    $kioskExcludeCategoryIds: [String]
    $kioskExcludeProductIds: [String]
    $deliveryConfig: JSON
    $permissionConfig: JSON
    $customerCreateConfig: JSON
    $allowTypes: [String]
    $isShowRemainder: Boolean
    $isCheckRemainder: Boolean
    $checkExcludeCategoryIds: [String]
    $saveRemainder: Boolean
    $banFractions: Boolean
  ) {
    posEdit(
      _id: $_id
      name: $name
      description: $description
      orderPassword: $orderPassword
      scopeBrandIds: $scopeBrandIds
      pdomain: $pdomain
      serviceCharge: $serviceCharge
      serviceChargeApplicableProductId: $serviceChargeApplicableProductId
      productDetails: $productDetails
      adminIds: $adminIds
      cashierIds: $cashierIds
      paymentIds: $paymentIds
      paymentTypes: $paymentTypes
      earnScoreCampaignId: $earnScoreCampaignId
      earnTier: $earnTier
      acceptCoupons: $acceptCoupons
      isOnline: $isOnline
      onServer: $onServer
      branchId: $branchId
      departmentId: $departmentId
      allowBranchIds: $allowBranchIds
      beginNumber: $beginNumber
      maxSkipNumber: $maxSkipNumber
      kitchenScreen: $kitchenScreen
      waitingScreen: $waitingScreen
      kioskMachine: $kioskMachine
      uiOptions: $uiOptions
      catProdMappings: $catProdMappings
      initialCategoryIds: $initialCategoryIds
      kioskExcludeCategoryIds: $kioskExcludeCategoryIds
      kioskExcludeProductIds: $kioskExcludeProductIds
      deliveryConfig: $deliveryConfig
      cardsConfig: $cardsConfig
      permissionConfig: $permissionConfig
      customerCreateConfig: $customerCreateConfig
      allowTypes: $allowTypes
      isShowRemainder: $isShowRemainder
      isCheckRemainder: $isCheckRemainder
      checkExcludeCategoryIds: $checkExcludeCategoryIds
      saveRemainder: $saveRemainder
      banFractions: $banFractions
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

const posRemove = gql(`
  mutation posRemove($_id: String!) {
    posRemove(_id: $_id)
  }
`);

const brandAdd = gql(`
  mutation brandsAdd($name: String!, $description: String, $emailConfig: JSON) {
    brandsAdd(
      name: $name
      description: $description
      emailConfig: $emailConfig
    ) {
      _id
    }
  }
`);

const saveProductGroups = gql(`
  mutation productGroupsBulkInsert($posId: String!, $groups: [GroupInput]) {
    productGroupsBulkInsert(posId: $posId, groups: $groups) {
      _id
    }
  }
`);

const saveSlots = gql(`
  mutation posSlotBulkUpdate($posId: String!, $slots: [SlotInput]) {
    posSlotBulkUpdate(posId: $posId, slots: $slots) {
      _id
      posId
      code
      name
      option
    }
  }
`);

export const mutations = {
  posAdd,
  posEdit,
  posRemove,
  brandAdd,
  saveProductGroups,
  saveSlots,
};
