export const types = `
  type TdbOrder {
    id: Int
    typeRid: String
    amount: Float
    currency: String
    description: String
    language: String
    hppRedirectUrl: String
    password: String
    status: String
  }

  type TdbOrderCreateResponse {
    success: Boolean
    msg: String
    order: TdbOrder
  }
`;

export const mutations = `
  tdbCreateOrder(
    configId: String!
    input: TdbOrderInput!
  ): TdbOrderCreateResponse
`;

export const inputTypes = `
  input TdbOrderInput {
    typeRid: String
    amount: Float!
    currency: String!
    description: String
    language: String
    hppRedirectUrl: String!
  }
`;
