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

const pricingPlans = `
  query PricingPlans($status: String) {
    pricingPlans(status: $status) {
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
  pricingPlanDetail
};
