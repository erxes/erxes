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
  limit: Int,
  cursor: String,
  direction: CURSOR_DIRECTION,
  orderBy: JSON,
`;

export const types = `
  type SyncMsdHistory {
    _id: String
    type: String
    contentType: String
    contentId: String
    createdAt: Date
    createdBy: String
    consumeData: JSON
    consumeStr: String
    sendData: JSON
    sendStr: String
    responseData: JSON
    responseStr: String
    sendSales: [String]
    responseSales: [String]
    error: String
    content: String
    createdUser: JSON
  }

  type SyncMsdHistoryListResponse {
    list: [SyncMsdHistory]
    pageInfo: PageInfo
    totalCount: Int
  }

  type MsdCustomerRelation {
    _id: String
    customerId: String
    brandId: String
    no: String
    modifiedAt: Date
    filter: String
    response: JSON
    brand: JSON
  }

  type MsdCheckResponse {
    _id: String
    isSynced: Boolean
    syncedDate: String
    syncedBillNumber: String
    syncedCustomer: String
  }

  type MsdCheckGroup {
    items: [JSON]!
    count: Int
  }

  type MsdCheckCount {
    count: Int!
  }

  type MsdProductsCheckResult {
    create: MsdCheckGroup!
    update: MsdCheckGroup!
    delete: MsdCheckGroup!
    matched: Int!
  }

  type MsdCategoriesCheckResult {
    create: MsdCheckGroup!
    update: MsdCheckGroup!
    delete: MsdCheckGroup!
    matched: MsdCheckCount!
  }

  type MsdCustomersCheckResult {
    create: MsdCheckGroup!
    update: MsdCheckGroup!
    delete: MsdCheckGroup!
    error: MsdCheckGroup!
  }

  type MsdPricesCheckResult {
    create: MsdCheckGroup!
    update: MsdCheckGroup!
    delete: MsdCheckGroup!
    match: MsdCheckGroup!
    error: MsdCheckGroup!
  }
`;

export const queries = `
  syncMsdHistories(${commonHistoryParams}): SyncMsdHistoryListResponse
  syncMsdHistoriesCount(${commonHistoryParams}): Int
  msdProductsRemainder(
    brandId: String,
    productCodes: [String],
    posToken: String,
    branchId: String
  ): JSON
  msdCustomerRelations(customerId: String): [MsdCustomerRelation]
`;

export const mutations = `
  toCheckMsdProducts(brandId: String): MsdProductsCheckResult
  toSyncMsdProducts(brandId: String, action: String, products: [JSON]): JSON
  toSyncMsdCustomers(brandId: String, action: String, customers: [JSON]): JSON
  toSendMsdOrders(orderIds: [String]): [MsdCheckResponse]
  toCheckMsdSynced(ids: [String]): [MsdCheckResponse]
  toCheckMsdCustomers(brandId: String): MsdCustomersCheckResult
  toCheckMsdPrices(brandId: String): MsdPricesCheckResult
  toSyncMsdPrices(prices: [JSON], brandId: String): JSON
  toCheckMsdProductCategories(brandId: String, categoryId: String): MsdCategoriesCheckResult
  toSyncMsdProductCategories(brandId: String, action: String!, categoryId: String, categories: [JSON!]!): JSON
`;
