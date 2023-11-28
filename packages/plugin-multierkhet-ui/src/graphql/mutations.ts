// Settings

const updateConfigs = `
  mutation multierkhetConfigsUpdate($configsMap: JSON!) {
    multierkhetConfigsUpdate(configsMap: $configsMap)
  }
`;

const toCheckSynced = `
  mutation toMultiCheckSynced($ids: [String], $type: String) {
    toMultiCheckSynced(ids: $ids, type: $type) 
  }
`;

const toSyncDeals = `
  mutation toMultiSyncDeals($dealIds: [String], $configStageId: String, $dateType: String) {
    toMultiSyncDeals(dealIds: $dealIds, configStageId: $configStageId, dateType: $dateType)
  }
`;

const toSyncOrders = `
  mutation toMultiSyncOrders($orderIds: [String]) {
    toMultiSyncOrders(orderIds: $orderIds)
  }
`;

const toCheckProducts = `
  mutation toMultiCheckProducts($brandId: String) {
    toMultiCheckProducts(brandId: $brandId)
  }
`;

const toSyncProducts = `
  mutation toMultiSyncProducts($brandId: String, $action: String, $products: [JSON]) {
    toMultiSyncProducts(brandId: $brandId, action: $action, products: $products)
  }
`;

const toCheckCategories = `
  mutation toMultiCheckCategories($brandId: String) {
    toMultiCheckCategories(brandId: $brandId)
  }
`;

const toSyncCategories = `
  mutation toMultiSyncCategories($brandId: String, $action: String, $categories: [JSON]) {
    toMultiSyncCategories(brandId: $brandId, action: $action, categories: $categories)
  }
`;

export default {
  updateConfigs,
  toCheckSynced,
  toSyncDeals,
  toSyncOrders,
  toCheckCategories,
  toCheckProducts,
  toSyncCategories,
  toSyncProducts
};
