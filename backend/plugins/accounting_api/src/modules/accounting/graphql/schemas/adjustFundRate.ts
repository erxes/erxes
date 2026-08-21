import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = () => `
  type AdjustFundRateDetail @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String!
    accountId: String
    accountCode: String
    accountName: String
    accountCurrency: String
    mainBalance: Float
    currencyBalance: Float
    diff: Float
    transactionId: String
    branchId: String
    departmentId: String
    createdAt: Date
    updatedAt: Date
  }

  type AdjustFundRate @key(fields: "_id") @cacheControl(maxAge: 3){
    _id: String!
    date: Date
    mainCurrency: String
    currency: String
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
    details: [AdjustFundRateDetail]
    createdBy: String
    modifiedBy: String
    createdAt: Date
    updatedAt: Date
  }

  type AdjustFundRatesListResponse {
    list: [AdjustFundRate],
    pageInfo: PageInfo
    totalCount: Int,
  }
`;

const adjustFundRateParams = `
  date: Date,
  mainCurrency: String,
  currency: String,
  description: String,
  spotRate: Float,
  gainAccountId: String,
  lossAccountId: String,
`;

const adjustFundRateFilterParams = `
  ids: [String],
  date: Date,
  mainCurrency: String,
  currency: String,
  searchValue: String,
`;

export const queries = `
  adjustFundRates(${adjustFundRateFilterParams} ${GQL_CURSOR_PARAM_DEFS}): AdjustFundRatesListResponse
  adjustFundRateDetail(_id: String!): AdjustFundRate
`;

export const mutations = `
  adjustFundRateAdd(${adjustFundRateParams}): AdjustFundRate
  adjustFundRateChange(_id: String!, ${adjustFundRateParams}): AdjustFundRate
  adjustFundRateCalculate(_id: String!): AdjustFundRate
  adjustFundRateDoTransaction(_id: String!): AdjustFundRate
  adjustFundRateRun(_id: String!): AdjustFundRate
  adjustFundRateRemove(adjustFundRateIds: [String!]!): JSON
`;
