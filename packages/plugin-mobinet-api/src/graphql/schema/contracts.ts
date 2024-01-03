export const types = `
  type MobiContract {
    _id: String
    customerId: String
    buildingId: String
    documentId: String
    buildingAssetId: String
    productIds: [String]

    building: Building
  }
`;

export const queries = `
  mobiContracts(customerId: String): [MobiContract]
  mobiContractsGetByTicket(ticketId: String!): JSON
`;

export const mutations = `
  mobiContractsCreate(ticketId: String!, assetId: String!): MobiContract
`;
