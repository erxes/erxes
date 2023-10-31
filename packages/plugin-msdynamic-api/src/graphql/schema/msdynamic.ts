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
`;
