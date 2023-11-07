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

export default {
  updateConfigs,
  toCheckProducts,
  toSyncProducts
};
