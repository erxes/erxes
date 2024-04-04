export const mutations = `
  toMultiCheckSynced(ids: [String], type: String): JSON
  toMultiSyncDeals(dealIds: [String], configStageId: String, dateType: String): JSON
  toMultiSyncOrders(orderIds: [String]): JSON
  toMultiCheckProducts(brandId: String): JSON
  toMultiCheckCategories(brandId: String): JSON
  toMultiSyncCategories(brandId: String, action: String, categories: [JSON]): JSON
  toMultiSyncProducts(brandId: String, action: String, products: [JSON]): JSON
`;
