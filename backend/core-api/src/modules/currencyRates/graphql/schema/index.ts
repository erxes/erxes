import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  type CurrencyRate {
    _id: String!
    date: Date
    mainCurrency: String
    rateCurrency: String
    rate: Float
    source: String
    createdBy: String
    createdAt: Date
    modifiedAt: Date
  }

  type CurrencyRatesListResponse {
    list: [CurrencyRate]
    pageInfo: PageInfo
    totalCount: Int
  }
`;

export const queries = `
  currencyRates(
    rateCurrency: String
    startDate: Date
    endDate: Date
    ${GQL_CURSOR_PARAM_DEFS}
  ): CurrencyRatesListResponse
`;

export const mutations = `
  currencyRateAdd(date: Date!, rateCurrency: String!, rate: Float!): CurrencyRate
  currencyRateEdit(_id: String!, date: Date, rateCurrency: String, rate: Float): CurrencyRate
  currencyRatesRemove(_ids: [String!]!): String
`;
