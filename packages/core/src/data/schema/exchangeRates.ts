const rateFields = `
  _id: String!
  date: Date
  mainCurrency: String
  rateCurrency: String
  rate: Float
  createdAt: Date
  modifiedAt: Date
`;

export const types = `
  type ExchangeRate @key(fields: "_id") {
    ${rateFields}
  }

  type ExchangeRatesListResponse {
    list: [ExchangeRate],
    totalCount: Int,
  }
`;

const rateParams = `
  date: Date
  mainCurrency: String
  rateCurrency: String
  rate: Float
`;

export const queries = `
  exchangeRatesMain(page: Int, perPage: Int, searchValue: String): ExchangeRatesListResponse
  exchangeGetRate(date: Date, currency: String, mainCurrency: String): ExchangeRate
`;

export const mutations = `
  exchangeRateAdd(${rateParams}): ExchangeRate
  exchangeRateEdit(_id: String!, ${rateParams}): ExchangeRate
  exchangeRatesRemove(rateIds: [String!]): String
`;
