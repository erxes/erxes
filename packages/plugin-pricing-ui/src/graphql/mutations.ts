const pricingPlanAdd = `
  mutation PricingPlanAdd($doc: PricingPlanAddInput) {
    pricingPlanAdd(doc: $doc) {
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
      updatedAt
      updatedBy
    }
  }
`;

const pricingPlanEdit = `
  mutation PricingPlanEdit($doc: PricingPlanEditInput) {
    pricingPlanEdit(doc: $doc) {
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
      updatedAt
      updatedBy
    }
  }
`;

const pricingPlanRemove = `
  mutation PricingPlanRemove($id: String) {
    pricingPlanRemove(id: $id) {
      _id
    }
  }
`;

export default {
  pricingPlanAdd,
  pricingPlanEdit,
  pricingPlanRemove
};
