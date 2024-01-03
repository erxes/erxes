const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const toCheckProducts = `
  mutation toCheckProducts {
    toCheckProducts
  }
`;

const toSyncProducts = `
  mutation toSyncProducts($action: String, $products: [JSON]) {
    toSyncProducts(action: $action, products: $products)
  }
`;

const toCheckCategories = `
  mutation toCheckProductCategories {
    toCheckProductCategories
  }
`;

const toSyncCategories = `
  mutation toSyncProductCategories($action: String, $categories: [JSON]) {
    toSyncProductCategories(action: $action, categories: $categories)
  }
`;

const toCheckCustomers = `
  mutation toCheckCustomers {
    toCheckCustomers
  }
`;

const toSyncCustomers = `
  mutation toSyncCustomers($action: String, $customers: [JSON]) {
    toSyncCustomers(action: $action, customers: $customers)
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
