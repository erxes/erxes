// Settings

const updateConfigs = `
  mutation configsUpdate($configsMap: JSON!) {
    configsUpdate(configsMap: $configsMap)
  }
`;

const toCheckSyncedDeals = `
  mutation toCheckSyncedDeals($dealIds: [String]) {
    toCheckSyncedDeals(dealIds: $dealIds) {
      dealId
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

export default {
  updateConfigs,
  toCheckSyncedDeals,
  toSyncDeals
};
