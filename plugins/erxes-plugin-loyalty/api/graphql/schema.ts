export const types = `
  type LoyaltyConfig {
    _id: String!
    code: String!
    value: JSON
  }

  type CustomerLoyalty {
    customerId: String
    loyalty: Float
  }

  type Loyalty {
    modifiedAt: Date,
    customerId: String,
    value: Float,
    dealId: String,
    userId: String,

    user: User
    customer: Customer
    deal: Deal
  }
`;

export const queries = `
  loyaltyConfigs: [LoyaltyConfig]

  customerLoyalties(
    customerId: String!
    page: Int
    perPage: Int
  ): [Loyalty]

  customerLoyalty(
    customerId: String!
  ): CustomerLoyalty
`;

export const mutations = `
  loyaltyConfigsUpdate(configsMap: JSON!): JSON
`;