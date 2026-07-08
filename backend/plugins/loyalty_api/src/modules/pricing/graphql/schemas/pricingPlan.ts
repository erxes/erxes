export const types = `
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

  type PricingPlan {
    _id: String,
    name: String,
    status: String,
    type: String,
    value: Float,
    priceAdjustType: String,
    priceAdjustFactor: Int,
    bonusProduct: String,
    priority: String,

    applyType: String,

    products: [String],
    productsExcluded: [String],
    productsBundle: [[String]],
    categories: [String],
    categoriesExcluded: [String],
    segments: [String],
    vendors: [String],
    tags: [String],
    tagsExcluded: [String],

    customerIds: [String],
    customerTags: [String],
    customerExcludeTags: [String],
    customerSegmentIds: [String],

    companyIds: [String],
    companyTags: [String],
    companyExcludeTags: [String],
    companySegmentIds: [String],

    userIds: [String],
    userPositions: [String],
    userSegmentIds: [String],

    brokerCustomerIds: [String],
    brokerCustomerTags: [String],
    brokerCustomerExcludeTags: [String],
    brokerCustomerSegmentIds: [String],

    brokerCompanyIds: [String],
    brokerCompanyTags: [String],
    brokerCompanyExcludeTags: [String],
    brokerCompanySegmentIds: [String],

    brokerUserIds: [String],
    brokerUserPositions: [String],
    brokerUserSegmentIds: [String],

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

    productIds: [String]

   fixedValues: [PricingFixedValue]    
     
  }
     type PricingFixedValue {
      _id: String
      pricingPlanId: String
      productId: String
      sortField: String
      uom: String
      unitPrice: Float
      newPrice: Float
      createdBy: String
      updatedBy: String
      createdAt: Date
      updatedAt: Date
    }
  
    type PricingFixedValuePageItem {
      _id: String
      productId: String
      productName: String
      sortField: String
      uom: String
      unitPrice: Float
      newPrice: Float
      status: String
    }

    type PricingFixedValuePageResult {
      list: [PricingFixedValuePageItem]
      totalCount: Int
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
    priority: String,

    applyType: String,

    products: [String],
    productsExcluded: [String],
    productsBundle: [[String]],
    categories: [String],
    categoriesExcluded: [String],
    segments: [String],
    vendors: [String],
    tags: [String],
    tagsExcluded: [String],

    customerIds: [String],
    customerTags: [String],
    customerExcludeTags: [String],
    customerSegmentIds: [String],

    companyIds: [String],
    companyTags: [String],
    companyExcludeTags: [String],
    companySegmentIds: [String],

    userIds: [String],
    userPositions: [String],
    userSegmentIds: [String],

    brokerCustomerIds: [String],
    brokerCustomerTags: [String],
    brokerCustomerExcludeTags: [String],
    brokerCustomerSegmentIds: [String],

    brokerCompanyIds: [String],
    brokerCompanyTags: [String],
    brokerCompanyExcludeTags: [String],
    brokerCompanySegmentIds: [String],

    brokerUserIds: [String],
    brokerUserPositions: [String],
    brokerUserSegmentIds: [String],

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
    priority: String,

    applyType: String,

    products: [String],
    productsExcluded: [String],
    productsBundle: [[String]],
    categories: [String],
    categoriesExcluded: [String],
    segments: [String],
    vendors: [String],
    tags: [String],
    tagsExcluded: [String],

    customerIds: [String],
    customerTags: [String],
    customerExcludeTags: [String],
    customerSegmentIds: [String],

    companyIds: [String],
    companyTags: [String],
    companyExcludeTags: [String],
    companySegmentIds: [String],

    userIds: [String],
    userPositions: [String],
    userSegmentIds: [String],

    brokerCustomerIds: [String],
    brokerCustomerTags: [String],
    brokerCustomerExcludeTags: [String],
    brokerCustomerSegmentIds: [String],

    brokerCompanyIds: [String],
    brokerCompanyTags: [String],
    brokerCompanyExcludeTags: [String],
    brokerCompanySegmentIds: [String],

    brokerUserIds: [String],
    brokerUserPositions: [String],
    brokerUserSegmentIds: [String],

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
    quantityRules: [QuantityRuleInput],

    isPriceEnabled: Boolean,
    priceRules: [PriceRuleInput],

    isExpiryEnabled: Boolean,
    expiryRules: [ExpiryRuleInput],

    isRepeatEnabled: Boolean,
    repeatRules: [RepeatRuleInput],
  }

  input PricingFixedValueInput {
      productId: String
      sortField: String
      uom: String
      unitPrice: Float
      newPrice: Float
    }

  input PricingCheckProduct {
    itemId: String
    productId: String
    quantity: Float
    price: Float
    manufacturedDate: String
  }

`;

const pricingQueryParams = `
  status: String
  priority: String
  branchId: String
  departmentId: String
  productId: String
  date: Date

  findOne: Boolean
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int

  isQuantityEnabled: Boolean
  isPriceEnabled: Boolean
  isExpiryEnabled: Boolean
  isRepeatEnabled: Boolean

  totalAmount: String
  quantity: Float
`;

const checkDiscountParams = `
  prioritizeRule: String
  totalAmount: Float
  departmentId: String
  branchId: String
  pipelineId: String
  customerType: String
  customerId: String
  brokerType: String
  brokerId: String
  products: [PricingCheckProduct]
`;

export const queries = `
  pricingPlans(${pricingQueryParams}): [PricingPlan]
  cpPricingPlans(${pricingQueryParams}): [PricingPlan]
  pricingPlansCount(${pricingQueryParams}): Int
     pricingPlanDetail(id: String): PricingPlan
    pricingFixedValuesPage(
      pricingPlanId: String!
      page: Int
      perPage: Int
      search: String
    ): PricingFixedValuePageResult
  pricingCheckDiscount(${checkDiscountParams}): JSON
`;

export const mutations = `
  pricingPlanAdd(doc: PricingPlanAddInput): PricingPlan
  pricingPlanEdit(doc: PricingPlanEditInput): PricingPlan
  pricingPlanRemove(id: String): PricingPlan
  pricingPlansRecalculatePublicDiscounts: JSON

  pricingFixedValueAdd(pricingPlanId: String!, doc: PricingFixedValueInput!): PricingFixedValue
  pricingFixedValueEdit(id: String!, doc: PricingFixedValueInput!): PricingFixedValue
  pricingFixedValueRemove(id: String!): PricingFixedValue
`;
