export const types = () => `
  type ContractType {
    _id: String!
    code: String
    name: String
    description: String
    status: String
    number: String
    vacancy: Float
    leaseType: String
    currency: String

    defaultInterest: Float
    useSkipInterest: Boolean
    skipInterestDay: Float
    skipInterestMonth: Float
    skipPaymentDay: Float
    skipPaymentMonth: Float

    lossPercent: Float
    lossCalcType: String
    skipLossDay: Float
    allowLateDay: Float

    allowPartOfLease: Boolean
    limitIsCurrent: Boolean
    commitmentInterest: Float

    useMargin: Boolean
    useDebt: Boolean
    useManualNumbering: Boolean

    savingPlusLoanInterest: Float
    savingUpperPercent: Float

    config: JSON
    productId: String
    productType: String

    createdAt: Date
    modifiedAt: Date

    product: Product

    feePercent: Float
    defaultFee: Float
    useCollateral: Boolean
    minPercentMargin: Float

    overPaymentIsNext: Boolean
    collectivelyRule: String
  }

  type ContractTypesListResponse {
    list: [ContractType],
    totalCount: Float,
  }
  
  type loanContractCategories {
    categories: JSON
    products: JSON
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  ids: [String]
  searchValue: String
  sortField: String
  sortDirection: Int
  productId: String
  productType: String
  leaseType: String
`;

export const queries = `
  contractTypesMain(${queryParams}): ContractTypesListResponse
  contractTypes(${queryParams}): [ContractType]
  contractTypeDetail(_id: String!): ContractType
  loanContractCategories(productCategoryIds: [String], productIds: [String], step: Int): loanContractCategories
`;

const commonFields = `
  code: String
  name: String
  description: String
  status: String
  number: String
  vacancy: Float
  leaseType: String
  currency: String

  defaultInterest: Float
  useSkipInterest: Boolean
  skipInterestDay: Float
  skipInterestMonth: Float
  skipPaymentDay: Float
  skipPaymentMonth: Float

  lossPercent: Float
  lossCalcType: String
  skipLossDay: Float
  allowLateDay: Float

  allowPartOfLease: Boolean
  limitIsCurrent: Boolean
  commitmentInterest: Float

  useMargin: Boolean
  useDebt: Boolean
  useManualNumbering: Boolean

  savingPlusLoanInterest: Float
  savingUpperPercent: Float

  config: JSON
  productId: String
  productType: String

  feePercent: Float
  defaultFee: Float
  useCollateral: Boolean
  minPercentMargin: Float

  overPaymentIsNext: Boolean
  collectivelyRule: String
`;

export const mutations = `
  contractTypesAdd(${commonFields}): ContractType
  contractTypesEdit(_id: String!, ${commonFields}): ContractType
  contractTypesRemove(contractTypeIds: [String]): [String]
`;
