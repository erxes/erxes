import { gql } from '@apollo/client';

export const checkSyncedMutation = gql`
  mutation ToCheckSynced($ids: [String], $contentType: String) {
    toCheckSynced(ids: $ids, contentType: $contentType) {
      _id
      isSynced
      syncedDate
      syncedBillNumber
      syncedCustomer
    }
  }
`;

export const syncDealsMutation = gql`
  mutation ToSyncDeals(
    $dealIds: [String]
    $configStageId: String
    $dateType: String
  ) {
    toSyncDeals(
      dealIds: $dealIds
      configStageId: $configStageId
      dateType: $dateType
    )
  }
`;

export const syncOrdersMutation = gql`
  mutation ToSyncOrders($orderIds: [String]) {
    toSyncOrders(orderIds: $orderIds)
  }
`;
