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
  toCheckCustomers,
  toSyncCustomers
};
