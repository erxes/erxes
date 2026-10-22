export const mutations = `
  toCheckSynced(ids: [String], contentType: String): [CheckResponse]
  toSyncDeals(dealIds: [String], configStageId: String, dateType: String): ErkhetSyncResult
  toSyncOrders(orderIds: [String]): ErkhetSyncResult
  toCheckProducts(productCodes: [String]): ErkhetProductsCheckResult
  toCheckCategories(categoryCodes: [String]): ErkhetCategoriesCheckResult
  toSyncCategories(action: String, categories: [JSON]): JSON
  toSyncProducts(action: String, products: [JSON]): JSON
`;
