const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const toCheckProducts = `
  mutation toCheckProducts($brandId: String) {
    toCheckProducts(brandId: $brandId)
  }
`;

const toSyncProducts = `
  mutation toSyncProducts($brandId: String, $action: String, $products: [JSON]) {
    toSyncProducts(brandId: $brandId, action: $action, products: $products)
  }
`;

const toCheckCategories = `
  mutation toCheckProductCategories($brandId: String) {
    toCheckProductCategories(brandId: $brandId)
  }
`;

const toSyncCategories = `
  mutation toSyncProductCategories($brandId: String, $action: String, $categories: [JSON]) {
    toSyncProductCategories(brandId: $brandId, action: $action, categories: $categories)
  }
`;

const toCheckCustomers = `
  mutation toCheckCustomers($brandId: String) {
    toCheckCustomers(brandId: $brandId)
  }
`;

const toSyncCustomers = `
  mutation toSyncCustomers($brandId: String, $action: String, $customers: [JSON]) {
    toSyncCustomers(brandId: $brandId, action: $action, customers: $customers)
  }
`;

export default {
  updateConfigs,
  toCheckProducts,
  toSyncProducts,
  toCheckCategories,
  toSyncCategories,
  toCheckCustomers,
  toSyncCustomers
};
