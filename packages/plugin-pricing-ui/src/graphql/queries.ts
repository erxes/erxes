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
  $totalAmount: String
  $productId: String
  $quantity: Float
  $date: Date
  $findOne: Boolean
  $page: Int
  $perPage: Int
  $sortField: String
  $sortDirection: Int
`;

const pricingParamsValues = `
  status: $status
  prioritizeRule: $prioritizeRule
  branchId: $branchId
  departmentId: $departmentId
  totalAmount: $totalAmount
  productId: $productId
  quantity: $quantity
  date: $date
  findOne: $findOne
  page: $page
  perPage: $perPage
  sortField: $sortField
  sortDirection: $sortDirection
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
