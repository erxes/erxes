export const types = `

  type AccountingsCongig {
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
  accountingsConfigs: [AccountingsCongig]
  accountingsGetRate(date: Date, currency: String): ExchangeRate
`;

export const mutations = `
  accountingsConfigsUpdate(configsMap: JSON!): JSON
`;
