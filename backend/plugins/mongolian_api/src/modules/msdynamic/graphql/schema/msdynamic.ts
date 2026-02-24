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

export const types = `
  type SyncMsdHistory {
    _id: String
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
`;

export const queries = `
  syncMsdHistories(${commonHistoryParams}): [SyncMsdHistory]
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
  toCheckMsdProducts(brandId: String): JSON
  toSyncMsdProducts(brandId: String, action: String, products: [JSON]): JSON
  toSyncMsdCustomers(brandId: String, action: String, customers: [JSON]): JSON
  toSendMsdOrders(orderIds: [String]): MsdCheckResponse
`;