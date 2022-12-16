import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `
  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type Quantity {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
  }

  type Price {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
  }

  type Expiry {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
  }

  type RepeatValue {
    label: String,
    value: String,
  }

  type Repeat {
    type: String,
    dayStartValue: Date,
    dayEndValue: Date,
    weekValue: [RepeatValue],
    monthValue: [RepeatValue],
    yearStartValue: Date,
    yearEndValue: Date,
  }

  type Discount @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    name: String,
    status: String,
    type: String,
    value: Float,
    bonusProduct: String,

    applyType: String,

    products: [String],
    productsExcluded: [String],
    categories: [String],
    categoriesExcluded: [String],

    isStartDateEnabled: Boolean,
    isEndDateEnabled: Boolean,

    startDate: Date,
    endDate: Date,

    branchIds: [String],
    departmentIds: [String],
    boardId: String,
    pipelineId: String,
    stageId: String,
    
    isQuantityEnabled: Boolean,
    quantityRules: [Quantity],

    isPriceEnabled: Boolean,
    priceRules: [Price],

    isExpiryEnabled: Boolean,
    expiryRules: [Expiry],

    isRepeatEnabled: Boolean,
    repeatRules: [Repeat],

    createdAt: Date,
    createdBy: String,
    createdUser: User,
    updatedAt: Date,
    updatedBy: String,
    updatedUser: User
  }

  input QuantityInput {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
  }

  input PriceInput {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
  }

  input ExpiryInput {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
  }

  input RepeatValueInput {
    label: String,
    value: String,
  }

  input RepeatInput {
    type: String,
    dayStartValue: Date,
    dayEndValue: Date,
    weekValue: [RepeatValueInput],
    monthValue: [RepeatValueInput],
    yearStartValue: Date,
    yearEndValue: Date,
  }

  input DiscountAddInput {
    _id: String,
    name: String,
    status: String,
    type: String,
    value: Float,
    bonusProduct: String,

    applyType: String,

    products: [String],
    productsExcluded: [String],
    categories: [String],
    categoriesExcluded: [String],

    isStartDateEnabled: Boolean,
    isEndDateEnabled: Boolean,

    startDate: Date,
    endDate: Date,
    
    branchIds: [String],
    departmentIds: [String],
    boardId: String,
    pipelineId: String,
    stageId: String,

    isQuantityEnabled: Boolean,
    quantityRules: [QuantityInput],

    isPriceEnabled: Boolean,
    priceRules: [PriceInput],

    isExpiryEnabled: Boolean,
    expiryRules: [ExpiryInput],

    isRepeatEnabled: Boolean,
    repeatRules: [RepeatInput],
  }

  input DiscountEditInput {
    _id: String,
    name: String,
    status: String,
    type: String,
    value: Float,
    bonusProduct: String,

    isMinPurchaseEnabled: Boolean,
    minPurchaseValue: Float,

    applyType: String,

    products: [String],
    productsExcluded: [String],
    categories: [String],
    categoriesExcluded: [String],

    isStartDateEnabled: Boolean,
    isEndDateEnabled: Boolean,

    startDate: Date,
    endDate: Date,
    
    branchIds: [String],
    departmentIds: [String],
    boardId: String,
    pipelineId: String,
    stageId: String,

    isQuantityEnabled: Boolean,
    quantityRules: [QuantityInput],

    isPriceEnabled: Boolean,
    priceRules: [PriceInput],

    isExpiryEnabled: Boolean,
    expiryRules: [ExpiryInput],

    isRepeatEnabled: Boolean,
    repeatRules: [RepeatInput],
  }
`;

export const queries = `
  discounts(status: String): [Discount]
  discountDetail(id: String): Discount
`;

export const mutations = `
  discountAdd(doc: DiscountAddInput): Discount
  discountEdit(doc: DiscountEditInput): Discount
  discountRemove(id: String): Discount
`;
