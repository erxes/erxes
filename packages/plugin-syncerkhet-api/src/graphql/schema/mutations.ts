export const mutations = `
  toCheckSynced(ids: [String]): [CheckResponse]
  toSyncDeals(dealIds: [String]): JSON
  toSyncOrders(orderIds: [String]): JSON
  toCheckProducts(productCodes: [String]): JSON
  toCheckCategories(categoryCodes: [String]): JSON
  toSyncCategories(action: String, categories: [JSON]): JSON
  toSyncProducts(action: String, products: [JSON]): JSON
`;
