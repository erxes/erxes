import gql from 'graphql-tag';

// Sales Board/Pipeline/Stage queries
export const GET_BOARDS = gql`
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
`;

export const GET_PIPELINES = gql`
  query SalesPipelines($boardId: String) {
    salesPipelines(boardId: $boardId) {
      list {
        _id
        name
        boardId
      }
    }
  }
`;

export const GET_STAGES = gql`
  query SalesStages($pipelineId: String) {
    salesStages(pipelineId: $pipelineId) {
      _id
      name
      order
      pipelineId
    }
  }
`;

export const PRICING_PLANS = gql`
  query PricingPlans(
    $status: String
    $prioritizeRule: String
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
      status: $status
      prioritizeRule: $prioritizeRule
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
      isPriority
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
  }
`;

export const PRICING_PLAN_DETAIL = gql`
  query PricingPlanDetail($pricingPlanDetailId: String) {
    pricingPlanDetail(id: $pricingPlanDetailId) {
      _id
      name
      status
      type
      value
      priceAdjustType
      priceAdjustFactor
      bonusProduct
      isPriority
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
`;
