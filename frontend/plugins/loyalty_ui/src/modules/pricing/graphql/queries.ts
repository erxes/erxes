import { gql } from '~/gql';

// Sales Board/Pipeline/Stage queries
export const GET_BOARDS = gql(`
  query SalesBoards {
    salesBoards {
      _id
      name
      pipelines {
        _id
        name
      }
    }
  }
`);

export const GET_PIPELINES = gql(`
  query SalesPipelines($boardId: String) {
    salesPipelines(boardId: $boardId) {
      list {
        _id
        name
        boardId
      }
    }
  }
`);

export const GET_STAGES = gql(`
  query SalesStages($pipelineId: String) {
    salesStages(pipelineId: $pipelineId) {
      _id
      name
      order
      pipelineId
    }
  }
`);

export const PRICING_PLANS = gql(`
  query PricingPlans(
    $page: Int
    $perPage: Int
    $status: String
    $priority: String
    $branchId: String
    $departmentId: String
    $productId: String
    $date: Date
    $isQuantityEnabled: Boolean
    $isPriceEnabled: Boolean
    $isExpiryEnabled: Boolean
    $isRepeatEnabled: Boolean
  ) {
    pricingPlans(
      page: $page
      perPage: $perPage
      status: $status
      priority: $priority
      branchId: $branchId
      departmentId: $departmentId
      productId: $productId
      date: $date
      isQuantityEnabled: $isQuantityEnabled
      isPriceEnabled: $isPriceEnabled
      isExpiryEnabled: $isExpiryEnabled
      isRepeatEnabled: $isRepeatEnabled
    ) {
      _id
      name
      status
      createdAt
      createdBy
      updatedAt
      updatedBy
      type
      applyType
      startDate
      endDate
      priority
      isRepeatEnabled
      isQuantityEnabled
      isPriceEnabled
      isExpiryEnabled
      createdUser {
        details {
          fullName
        }
        email
      }
      updatedUser {
        details {
          fullName
        }
        email
      }
    }
    pricingPlansCount(
      status: $status
      priority: $priority
      branchId: $branchId
      departmentId: $departmentId
      productId: $productId
      date: $date
      isQuantityEnabled: $isQuantityEnabled
      isPriceEnabled: $isPriceEnabled
      isExpiryEnabled: $isExpiryEnabled
      isRepeatEnabled: $isRepeatEnabled
    )
  }
`);

export const PRICING_PLAN_DETAIL = gql(`
  query PricingPlanDetail($pricingPlanDetailId: String!) {
    pricingPlanDetail(id: $pricingPlanDetailId) {
      _id
      name
      status
      type
      value
      priceAdjustType
      priceAdjustFactor
      bonusProduct
      priority
      applyType
      products
      productsExcluded
      productsBundle
      categories
      categoriesExcluded
      segments
      vendors
      tags
      tagsExcluded
      customerIds
      customerTags
      customerExcludeTags
      customerSegmentIds
      companyIds
      companyTags
      companyExcludeTags
      companySegmentIds
      userIds
      userPositions
      userSegmentIds
      brokerCustomerIds
      brokerCustomerTags
      brokerCustomerExcludeTags
      brokerCustomerSegmentIds
      brokerCompanyIds
      brokerCompanyTags
      brokerCompanyExcludeTags
      brokerCompanySegmentIds
      brokerUserIds
      brokerUserPositions
      brokerUserSegmentIds
      isStartDateEnabled
      isEndDateEnabled
      startDate
      endDate
      branchIds
      departmentIds
      boardId
      pipelineId
      stageId
      isQuantityEnabled
      quantityRules {
        type
        value
        discountType
        discountValue
        discountBonusProduct
        priceAdjustType
        priceAdjustFactor
      }
      isPriceEnabled
      priceRules {
        type
        value
        discountType
        discountValue
        discountBonusProduct
        priceAdjustType
        priceAdjustFactor
      }
      isExpiryEnabled
      expiryRules {
        type
        value
        discountType
        discountValue
        discountBonusProduct
        priceAdjustType
        priceAdjustFactor
      }
      conditionRules {
        conditionCode
        discountType
        discountValue
        discountBonusProduct
        priceAdjustType
        priceAdjustFactor
      }
      isRepeatEnabled
      repeatRules {
        type
        dayStartValue
        dayEndValue
        weekValue {
          label
          value
        }
        monthValue {
          label
          value
        }
        yearStartValue
        yearEndValue
      }
      createdAt
      createdBy
      createdUser {
        _id
      }
      updatedAt
      updatedBy
      updatedUser {
        _id
      }
      productIds
    }
  }
`);

export const PRICING_FIXED_VALUES_PAGE = gql(`
  query PricingFixedValuesPage(
    $pricingPlanId: String!
    $page: Int
    $perPage: Int
    $search: String
  ) {
    pricingFixedValuesPage(
      pricingPlanId: $pricingPlanId
      page: $page
      perPage: $perPage
      search: $search
    ) {
      totalCount
      list {
        _id
        productId
        productName
        sortField
        uom
        unitPrice
        newPrice
        productStatus
        status
      }
    }
  }
`);

// Core product conditions a plan can give a discount to, matched by code.
export const PRICING_PRODUCT_CONDITIONS = gql(`
  query pricingProductConditions {
    productConditions {
      _id
      code
      name
    }
  }
`);
