// Settings

const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const toCheckSynced = `
  mutation toCheckSynced($ids: [String]) {
    toCheckSynced(ids: $ids) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
    }
  }
`;

const toSyncDeals = `
  mutation toSyncDeals($dealIds: [String]) {
    toSyncDeals(dealIds: $dealIds)
  }
`;

const toSyncOrders = `
  mutation toSyncOrders($orderIds: [String]) {
    toSyncOrders(orderIds: $orderIds)
  }
`;

export default {
  updateConfigs,
  toCheckSynced,
  toSyncDeals,
  toSyncOrders
};
