import { gql } from '~/gql';

export const POS_LIST = gql(`
  query salesPosNavigationList(
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
