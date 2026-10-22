import { gql } from '~/gql';

export const checkSyncedMutation = gql(`
  mutation erkhetCheckSynced($ids: [String], $contentType: String) {
    toCheckSynced(ids: $ids, contentType: $contentType) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
      syncedCustomer
    }
  }
`);

export const syncDealsMutation = gql(`
  mutation erkhetSyncDeals(
    $dealIds: [String]
    $configStageId: String
    $dateType: String
  ) {
    toSyncDeals(
      dealIds: $dealIds
      configStageId: $configStageId
      dateType: $dateType
    ) {
      skipped
      error
      success
    }
  }
`);

export const syncOrdersMutation = gql(`
  mutation erkhetSyncOrders($orderIds: [String]) {
    toSyncOrders(orderIds: $orderIds) {
      skipped
      error
      success
    }
  }
`);
