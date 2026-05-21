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
