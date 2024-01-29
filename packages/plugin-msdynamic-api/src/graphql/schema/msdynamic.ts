const commonHistoryParams = `
  page: Int,
  perPage: Int,
  sortField: String,
  sortDirection: Int,
  userId: String,
  startDate: Date,
  endDate: Date,
  contentType: String,
  contentId: String,
  searchConsume: String,
  searchSend: String,
  searchResponse: String,
  searchError: String,
`;

export const queries = `
  syncMsdHistories(${commonHistoryParams}): [SyncMsdHistory]
  syncMsdHistoriesCount(${commonHistoryParams}): Int
`;

export const mutations = `
  toCheckMsdProducts(brandId: String): JSON
  toSyncMsdProducts(brandId: String, action: String, products: [JSON]): JSON
  toCheckMsdPrices(brandId: String): JSON
  toSyncMsdPrices(brandId: String, action: String, prices: [JSON]): JSON
  toCheckMsdProductCategories(brandId: String): JSON
  toSyncMsdProductCategories(brandId: String, action: String, categories: [JSON]): JSON
  toCheckMsdCustomers(brandId: String): JSON
  toSyncMsdCustomers(brandId: String, action: String, customers: [JSON]): JSON
`;
