const params = `
  endPoint: String
  username: String
  password: String
`;

export const queries = `
  msdynamicConfigs: [Msdynamic]
  msdynamicsTotalCount: Int
`;

export const mutations = `
  msdynamicAddConfigs(${params}): Msdynamic
  msdynamicEditConfigs(_id:String!, ${params}): Msdynamic
  toCheckProducts(brandId: String): JSON
  toSyncProducts(brandId: String, action: String, products: [JSON]): JSON
  toCheckPrices(brandId: String): JSON
  toSyncPrices(brandId: String, action: String, prices: [JSON]): JSON
  toCheckProductCategories(brandId: String): JSON
  toSyncProductCategories(brandId: String, action: String, categories: [JSON]): JSON
  toCheckCustomers(brandId: String): JSON
  toSyncCustomers(brandId: String, action: String, customers: [JSON]): JSON
  toSendCustomers(brandId: String, customers: [JSON]): JSON
  toSendDeals(deals: [JSON]): JSON
`;
