export const types = `

  type AccountingsConfig {
    _id: String!
    code: String!
    value: JSON
  }

  type ExchangeRate {
    _id: String
    createdAt: Date
    modifiedAt: Date
    date: Date
    mainCurrency: String
    rateCurrency: String
    rate: Float
  }
`;

export const queries = `
  accountingsConfigs: [AccountingsConfig]
  accountingsConfigsByCode(codes: [String]): JSON
  accountingsGetRate(date: Date, currency: String): ExchangeRate
`;

export const mutations = `
  accountingsConfigsUpdate(configsMap: JSON!): JSON
`;
