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
`;

export const mutations = `
  mobiContractsCreate(customerId: String, buildingId: String, productIds: [String]): MobiContract
`;
