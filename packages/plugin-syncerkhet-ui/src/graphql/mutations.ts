// Settings

const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const toCheckSyncedDeals = `
  mutation toCheckSynced($ids: [String]) {
    toCheckSyncedDeals(ids: $ids) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
    }
  }
`;

const toCheckSyncedOrders = `
  mutation toCheckSyncedOrders($ids: [String]) {
    toCheckSyncedOrders(ids: $ids) {
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
    toSyncOrders(dealIds: $orderIds)
  }
`;

export default {
  updateConfigs,
  toCheckSyncedDeals,
  toSyncDeals,
  toCheckSyncedOrders,
  toSyncOrders
};
