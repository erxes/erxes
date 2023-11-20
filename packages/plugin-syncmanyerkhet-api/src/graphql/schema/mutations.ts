export const mutations = `
  manyToCheckSynced(ids: [String]): [ManyCheckResponse]
  manyToSyncDeals(dealIds: [String], configStageId: String, dateType: String): JSON
  manyToSyncOrders(orderIds: [String]): JSON
  manyToCheckProducts(brandId: String): JSON
  manyToCheckCategories(brandId: String): JSON
  manyToSyncCategories(brandId: String, action: String, categories: [JSON]): JSON
  manyToSyncProducts(brandId: String, action: String, products: [JSON]): JSON
`;
