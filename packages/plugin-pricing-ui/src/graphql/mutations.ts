const discountAdd = `
  mutation DiscountAdd($doc: DiscountAddInput) {
    discountAdd(doc: $doc) {
      _id
      name
      status
      type
      value
      bonusProduct

      applyType

      products
      productsExcluded
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
      }

      isPriceEnabled
      priceRules {
        type
        value
        discountType
        discountValue
        discountBonusProduct
      }

      isExpiryEnabled
      expiryRules {
        type
        value
        discountType
        discountValue
        discountBonusProduct
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

const discountEdit = `
  mutation DiscountEdit($doc: DiscountEditInput) {
    discountEdit(doc: $doc) {
      _id
      name
      status
      type
      value
      bonusProduct

      applyType

      products
      productsExcluded
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
      }

      isPriceEnabled
      priceRules {
        type
        value
        discountType
        discountValue
        discountBonusProduct
      }

      isExpiryEnabled
      expiryRules {
        type
        value
        discountType
        discountValue
        discountBonusProduct
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

const discountRemove = `
  mutation DiscountRemove($id: String) {
    discountRemove(id: $id) {
      _id
    }
  }
`;

export default {
  discountAdd,
  discountEdit,
  discountRemove
};
