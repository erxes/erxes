export const types = `
  type TdbOrderCreateResponse {
    order: TdbOrderCreateDetail!
  }

  type TdbOrderCreateDetail {
    id: Int!
    password: String!
    hppUrl: String!
    typeRid: String
    amount: Float!
    currency: String
    description: String
    language: String
    hppRedirectUrl: String
  }

  type TdbOrderDetail {
    id: Int!
    typeRid: String
    status: String!
    prevStatus: String
    lastStatusLogin: String
    amount: Float!
    currency: String
    createTime: String
    typeTitle: String
    isSuccessful: Boolean!
  }

  type TdbOrderStatus {
    orderId: Int!
    status: String!
    amount: Float!
    currency: String
    createTime: String
    isSuccessful: Boolean!
  }

  input TdbOrderInput {
    typeRid: String
    amount: Float!
    currency: String!
    description: String!
    language: String
    hppRedirectUrl: String!
  }
`;

export const mutations = `
  tdbCreateOrder(configId: String!, input: TdbOrderInput!): TdbOrderCreateResponse
`;

export const queries = `
  tdbOrderDetail(configId: String!, orderId: Int!, password: String!): TdbOrderDetail
  tdbOrderStatus(configId: String!, orderId: Int!, password: String!): TdbOrderStatus
`;