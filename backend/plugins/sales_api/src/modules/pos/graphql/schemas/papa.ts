export const types = `
  type SalesPapaConfig {
    apiUrl: String
    clientId: String
    hasSecret: Boolean
    staffId: String
    callbackUrl: String
    callbackRegisteredAt: Date
    updatedAt: Date
  }
`;

export const queries = `
  salesPapaConfig: SalesPapaConfig
  salesPapaReferences: JSON
  salesPapaAddresses: JSON
  salesPapaWallet: JSON
  posOrderPapaPhotoProof(_id: String!): JSON
  salesPapaDeliveryReport(posId: String, startDate: Date!, endDate: Date!, interval: String, timezone: String): JSON
`;

export const mutations = `
  salesPapaConfigSave(apiUrl: String, clientId: String!, clientSecret: String, staffPhone: String, staffEmail: String, staffFirstName: String, staffLastName: String): SalesPapaConfig
  salesPapaAddressCreate(locationId: String!, address: String!, latitude: String!, longitude: String!): JSON
  posOrderPapaQuote(_id: String!, toLocationId: String!, toAddress: String!, toLatitude: String!, toLongitude: String!, size: String): JSON
  posOrderPapaSend(_id: String!, receiverName: String, receiverPhone: String, description: String, receiverPays: Boolean): JSON
  posOrderPapaRefresh(_id: String!): JSON
  posOrderPapaCancel(_id: String!, reason: String): JSON
  posOrderPapaApprovePhoto(_id: String!): JSON
  posOrderPapaMarkDelivered(_id: String!): JSON
  posOrderPapaPay(_id: String!, method: String!): JSON
`;
