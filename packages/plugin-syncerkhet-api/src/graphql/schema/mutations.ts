export const mutations = `
  toCheckSynced(ids: [String]): [CheckResponse]
  toSyncDeals(dealIds: [String], configStageId: String, dateType: String): JSON
  toSyncOrders(orderIds: [String]): JSON
  toCheckProducts(brandId: String): JSON
  toCheckCategories(brandId: String): JSON
  toSyncCategories(brandId: String, action: String, categories: [JSON]): JSON
  toSyncProducts(brandId: String, action: String, products: [JSON]): JSON
`;
