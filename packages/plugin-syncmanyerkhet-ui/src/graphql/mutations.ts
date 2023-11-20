// Settings

const updateConfigs = `
  mutation syncmanyerkhetConfigsUpdate($configsMap: JSON!) {
    syncmanyerkhetConfigsUpdate(configsMap: $configsMap)
  }
`;

const toCheckSynced = `
  mutation manyToCheckSynced($ids: [String]) {
    manyToCheckSynced(ids: $ids) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
      syncedCustomer
    }
  }
`;

const toSyncDeals = `
  mutation manyToSyncDeals($dealIds: [String], $configStageId: String, $dateType: String) {
    manyToSyncDeals(dealIds: $dealIds, configStageId: $configStageId, dateType: $dateType)
  }
`;

const toSyncOrders = `
  mutation manyToSyncOrders($orderIds: [String]) {
    manyToSyncOrders(orderIds: $orderIds)
  }
`;

const toCheckProducts = `
  mutation manyToCheckProducts($brandId: String) {
    manyToCheckProducts(brandId: $brandId)
  }
`;

const toSyncProducts = `
  mutation manyToSyncProducts($brandId: String, $action: String, $products: [JSON]) {
    manyToSyncProducts(brandId: $brandId, action: $action, products: $products)
  }
`;

const toCheckCategories = `
  mutation manyToCheckCategories($brandId: String) {
    manyToCheckCategories(brandId: $brandId)
  }
`;

const toSyncCategories = `
  mutation manyToSyncCategories($brandId: String, $action: String, $categories: [JSON]) {
    manyToSyncCategories(brandId: $brandId, action: $action, categories: $categories)
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
