const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const toCheckProducts = `
  mutation toCheckMsdProducts($brandId: String) {
    toCheckMsdProducts(brandId: $brandId)
  }
`;

const toSyncProducts = `
  mutation toSyncMsdProducts($brandId: String, $action: String, $products: [JSON]) {
    toSyncMsdProducts(brandId: $brandId, action: $action, products: $products)
  }
`;

const toCheckCategories = `
  mutation toCheckMsdProductCategories($brandId: String) {
    toCheckMsdProductCategories(brandId: $brandId)
  }
`;

const toSyncCategories = `
  mutation toSyncMsdProductCategories($brandId: String, $action: String, $categories: [JSON]) {
    toSyncMsdProductCategories(brandId: $brandId, action: $action, categories: $categories)
  }
`;

const toCheckCustomers = `
  mutation toCheckMsdCustomers($brandId: String) {
    toCheckMsdCustomers(brandId: $brandId)
  }
`;

const toSyncCustomers = `
  mutation toSyncMsdCustomers($brandId: String, $action: String, $customers: [JSON]) {
    toSyncMsdCustomers(brandId: $brandId, action: $action, customers: $customers)
  }
`;

const toCheckPrices = `
  mutation toCheckMsdPrices($brandId: String) {
    toCheckMsdPrices(brandId: $brandId)
  }
`;

const toSyncPrices = `
  mutation toSyncMsdPrices($brandId: String, $action: String, $prices: [JSON]) {
    toSyncMsdPrices(brandId: $brandId, action: $action, prices: $prices)
  }
`;

export default {
  updateConfigs,
  toCheckProducts,
  toSyncProducts,
  toCheckCategories,
  toSyncCategories,
  toCheckCustomers,
  toSyncCustomers,
  toCheckPrices,
  toSyncPrices,
};
