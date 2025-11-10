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
  msdProductsRemainder(brandId: String, productCodes: [String], posToken: String, branchId: String): JSON
  msdCustomerRelations(customerId: String): [MsdCustomerRelation]
`;

export const mutations = `
  toCheckMsdProducts(brandId: String): JSON
  toSyncMsdProducts(brandId: String, action: String, products: [JSON]): JSON
  toSyncMsdPrices(brandId: String): JSON
  toCheckMsdProductCategories(brandId: String, categoryId: String): JSON
  toSyncMsdProductCategories(brandId: String, action: String, categoryId: String, categories: [JSON]): JSON
  toCheckMsdCustomers(brandId: String): JSON
  toSyncMsdCustomers(brandId: String, action: String, customers: [JSON]): JSON
  toCheckMsdSynced(ids: [String], brandId: String): [CheckResponse]
  toSendMsdOrders(orderIds: [String]): CheckResponse
`;
