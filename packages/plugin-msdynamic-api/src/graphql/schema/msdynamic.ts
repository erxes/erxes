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
  toCheckProducts: JSON
  toSyncProducts(action: String, products: [JSON]): JSON
  toCheckProductCategories: JSON
  toSyncProductCategories(action: String, categories: [JSON]): JSON
  toCheckCustomers: JSON
  toSyncCustomers(action: String, customers: [JSON]): JSON
  toSendCustomers(customers: [JSON]): JSON
  toSendDeals(deals: [JSON]): JSON
`;
