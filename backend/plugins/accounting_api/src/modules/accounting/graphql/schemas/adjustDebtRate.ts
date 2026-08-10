import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = () => `
  type AdjustDebtRateDetail @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String!
    accountId: String
    accountCode: String
    accountName: String
    accountKind: String
    accountCurrency: String
    customerType: String
    customerId: String
    branchId: String
    departmentId: String
    mainBalance: Float
    currencyBalance: Float
    diff: Float
    transactionId: String
    createdAt: Date
    updatedAt: Date
  }

  type AdjustDebtRate @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String!
    date: Date
    mainCurrency: String
    currency: String
    customerType: String
    customerId: String
    description: String
    spotRate: Float
    gainAccountId: String
    lossAccountId: String
    transactionId: String
    status: String
    beginDate: Date
    successDate: Date
    checkedAt: Date
    error: String
    warning: String
    details: [AdjustDebtRateDetail]
    branchId: String
    departmentId: String
    createdBy: String
    modifiedBy: String
    createdAt: Date
    updatedAt: Date
  }

  type AdjustDebtRatesListResponse {
    list: [AdjustDebtRate],
    pageInfo: PageInfo
    totalCount: Int,
  }
`;

const adjustDebtRateParams = `
  date: Date,
  mainCurrency: String,
  currency: String,
  customerType: String,
  customerId: String,
  description: String,
  spotRate: Float,
  gainAccountId: String,
  lossAccountId: String,
  branchId: String,
  departmentId: String,
`;
const adjustDebtRateFilterParams = `
  ids: [String],
  date: Date,
  mainCurrency: String,
  currency: String,
  customerId: String,
  searchValue: String,
  branchId: String,
  departmentId: String,
`;

export const queries = `
  adjustDebtRates(${adjustDebtRateFilterParams} ${GQL_CURSOR_PARAM_DEFS}): AdjustDebtRatesListResponse
  adjustDebtRateDetail(_id: String!): AdjustDebtRate
`;

export const mutations = `
  adjustDebtRatesAdd(${adjustDebtRateParams}): AdjustDebtRate
  adjustDebtRatesEdit(_id: String!, ${adjustDebtRateParams}): AdjustDebtRate
  adjustDebtRateCalculate(_id: String!): AdjustDebtRate
  adjustDebtRateDoTransaction(_id: String!): AdjustDebtRate
  adjustDebtRatesRemove(adjustDebtRateIds: [String!]!): JSON
`;
