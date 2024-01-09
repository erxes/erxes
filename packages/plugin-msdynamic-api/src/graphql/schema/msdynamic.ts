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
  syncHistories(${commonHistoryParams}): [SyncHistory]
  syncHistoriesCount(${commonHistoryParams}): Int
`;

export const mutations = `
  toCheckProducts(brandId: String): JSON
  toSyncProducts(brandId: String, action: String, products: [JSON]): JSON
  toCheckPrices(brandId: String): JSON
  toSyncPrices(brandId: String, action: String, prices: [JSON]): JSON
  toCheckProductCategories(brandId: String): JSON
  toSyncProductCategories(brandId: String, action: String, categories: [JSON]): JSON
  toCheckCustomers(brandId: String): JSON
  toSyncCustomers(brandId: String, action: String, customers: [JSON]): JSON
  toSendDeals(brandId: String, deals: [JSON]): JSON
`;
