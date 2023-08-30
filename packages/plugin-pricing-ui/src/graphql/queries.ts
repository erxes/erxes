export const commonFields = `
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
`;

const pricingParamsDefs = `
  $status: String
  $prioritizeRule: String
  $branchId: String
  $departmentId: String
  $productId: String
  $date: Date
  $findOne: Boolean
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
  $isQuantityEnabled: Boolean
  $isPriceEnabled: Boolean
  $isExpiryEnabled: Boolean
  $isRepeatEnabled: Boolean
  $totalAmount: String
  $quantity: Float
`;

const pricingParamsValues = `
  status: $status
  prioritizeRule: $prioritizeRule
  branchId: $branchId
  departmentId: $departmentId
  productId: $productId
  date: $date
  findOne: $findOne
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
  isQuantityEnabled: $isQuantityEnabled
  isPriceEnabled: $isPriceEnabled
  isExpiryEnabled: $isExpiryEnabled
  isRepeatEnabled: $isRepeatEnabled
  totalAmount: $totalAmount
  quantity: $quantity
`;

const pricingPlans = `
  query PricingPlans(${pricingParamsDefs}) {
    pricingPlans(${pricingParamsValues}) {
      _id
      name
      status
      createdAt
      createdBy
      updatedAt
      updatedBy
      createdUser {
        details {
          fullName
        }
      }
      updatedUser {
        details {
          fullName
        }
      }
    }
  }
`;

const pricingPlansCount = `
  query pricingPlansCount(${pricingParamsDefs}) {
    pricingPlansCount(${pricingParamsValues})
  }
`;

const pricingPlanDetail = `
  query PricingPlanDetail($id: String) {
    pricingPlanDetail(id: $id) {
      _id
      ${commonFields}
    }
  }
`;

export default {
  pricingPlans,
  pricingPlansCount,
  pricingPlanDetail
};
