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

  type QuantityRule {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
    priceAdjustType: String,
    priceAdjustFactor: Int
  }

  type PriceRule {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
    priceAdjustType: String,
    priceAdjustFactor: Int
  }

  type ExpiryRule {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
    priceAdjustType: String,
    priceAdjustFactor: Int
  }

  type RepeatValue {
    label: String,
    value: String,
  }

  type RepeatRule {
    type: String,
    dayStartValue: Date,
    dayEndValue: Date,
    weekValue: [RepeatValue],
    monthValue: [RepeatValue],
    yearStartValue: Date,
    yearEndValue: Date,
  }

  type PricingPlan @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String,
    name: String,
    status: String,
    type: String,
    value: Float,
    priceAdjustType: String,
    priceAdjustFactor: Int,
    bonusProduct: String,
    isPriority: Boolean,

    applyType: String,

    products: [String],
    productsExcluded: [String],
    productsBundle: [String],
    categories: [String],
    categoriesExcluded: [String],

    isStartDateEnabled: Boolean,
    isEndDateEnabled: Boolean,

    startDate: Date,
    endDate: Date,

    branchIds: [String],
    departmentIds: [String],
    boardId: [String],
    pipelineId: [String],
    stageId: [String],
    
    isQuantityEnabled: Boolean,
    quantityRules: [QuantityRule],
    
    isPriceEnabled: Boolean,
    priceRules: [PriceRule],
    
    isExpiryEnabled: Boolean,
    expiryRules: [ExpiryRule],

    isRepeatEnabled: Boolean,
    repeatRules: [RepeatRule],

    createdAt: Date,
    createdBy: String,
    createdUser: User,
    updatedAt: Date,
    updatedBy: String,
    updatedUser: User
  }

  input QuantityRuleInput {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
    priceAdjustType: String,
    priceAdjustFactor: Int
  }

  input PriceRuleInput {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
    priceAdjustType: String,
    priceAdjustFactor: Int
  }

  input ExpiryRuleInput {
    type: String,
    value: Float,
    discountType: String,
    discountValue: Float,
    discountBonusProduct: String,
    priceAdjustType: String,
    priceAdjustFactor: Int
  }

  input RepeatValueInput {
    label: String,
    value: String,
  }

  input RepeatRuleInput {
    type: String,
    dayStartValue: Date,
    dayEndValue: Date,
    weekValue: [RepeatValueInput],
    monthValue: [RepeatValueInput],
    yearStartValue: Date,
    yearEndValue: Date,
  }

  input PricingPlanAddInput {
    _id: String,
    name: String,
    status: String,
    type: String,
    value: Float,
    priceAdjustType: String,
    priceAdjustFactor: Int,
    bonusProduct: String,
    isPriority: Boolean,

    applyType: String,

    products: [String],
    productsExcluded: [String],
    productsBundle: [String],
    categories: [String],
    categoriesExcluded: [String],

    isStartDateEnabled: Boolean,
    isEndDateEnabled: Boolean,

    startDate: Date,
    endDate: Date,
    
    branchIds: [String],
    departmentIds: [String],
    boardId: [String],
    pipelineId: [String],
    stageId: [String],

    isQuantityEnabled: Boolean,
    quantityRules: [QuantityRuleInput],

    isPriceEnabled: Boolean,
    priceRules: [PriceRuleInput],

    isExpiryEnabled: Boolean,
    expiryRules: [ExpiryRuleInput],

    isRepeatEnabled: Boolean,
    repeatRules: [RepeatRuleInput],
  }

  input PricingPlanEditInput {
    _id: String,
    name: String,
    status: String,
    type: String,
    value: Float,
    priceAdjustType: String,
    priceAdjustFactor: Int,
    bonusProduct: String,
    isPriority: Boolean,

    applyType: String,

    products: [String],
    productsExcluded: [String],
    productsBundle: [String],
    categories: [String],
    categoriesExcluded: [String],

    isStartDateEnabled: Boolean,
    isEndDateEnabled: Boolean,

    startDate: Date,
    endDate: Date,
    
    branchIds: [String],
    departmentIds: [String],
    boardId: [String],
    pipelineId: [String],
    stageId: [String],

    isQuantityEnabled: Boolean,
    quantityRules: [QuantityRuleInput],

    isPriceEnabled: Boolean,
    priceRules: [PriceRuleInput],

    isExpiryEnabled: Boolean,
    expiryRules: [ExpiryRuleInput],

    isRepeatEnabled: Boolean,
    repeatRules: [RepeatRuleInput],
  }
`;

export const queries = `
  pricingPlans(status: String): [PricingPlan]
  pricingPlanDetail(id: String): PricingPlan
`;

export const mutations = `
  pricingPlanAdd(doc: PricingPlanAddInput): PricingPlan
  pricingPlanEdit(doc: PricingPlanEditInput): PricingPlan
  pricingPlanRemove(id: String): PricingPlan
`;
