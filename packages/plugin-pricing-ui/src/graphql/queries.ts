const discounts = `
  query discounts($status: String) {
    discounts(status: $status) {
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

const discountDetail = `
  query DiscountDetail($id: String) {
    discountDetail(id: $id) {
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
    }
  }
`;

export default {
  discounts,
  discountDetail
};
