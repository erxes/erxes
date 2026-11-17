import { gql } from '@apollo/client';

const LOCATION_FIELDS = `
  accountId
  branchId
  departmentId
  branch { _id title code }
  department { _id title code }
`;

const SCAN_FIELDS = `
  _id scannedCount matchedCount missingCount unknownCount openedCount otherZoneCount
  missingEpcIds unknownEpcIds openedEpcIds otherZoneEpcIds
  products { productId product { _id name code } expectedPacks scannedPacks }
  createdAt
`;

export const STORAGE_ZONES_QUERY = gql`
  query storageZones {
    storageZones { _id name sealed { ${LOCATION_FIELDS} } open { ${LOCATION_FIELDS} } }
  }
`;

export const STORAGE_RFID_SUMMARY_QUERY = gql`
  query storageRfidSummary($zoneId: String!) {
    storageRfidSummary(zoneId: $zoneId) {
      productId product { _id name code } sealedPacks sealedUnits openedPacks
    }
  }
`;

export const STORAGE_RFID_TAGS_QUERY = gql`
  query storageRfidTags($zoneId: String, $productId: String, $status: String, $page: Int, $perPage: Int) {
    storageRfidTags(zoneId: $zoneId, productId: $productId, status: $status, page: $page, perPage: $perPage) {
      totalCount
      list { _id epcId productId product { _id name code } unitsInPack status createdAt }
    }
  }
`;

export const STORAGE_MOVEMENTS_QUERY = gql`
  query storageMovements($accountingStatus: String, $page: Int, $perPage: Int) {
    storageMovements(accountingStatus: $accountingStatus, page: $page, perPage: $perPage) {
      _id number date accountingStatus accountingResponse
      items { productId product { _id name code } quantity epcIds }
    }
  }
`;

export const STORAGE_SCAN_SESSIONS_QUERY = gql`
  query storageScanSessions($zoneId: String!, $limit: Int) {
    storageScanSessions(zoneId: $zoneId, limit: $limit) { ${SCAN_FIELDS} }
  }
`;

/** Served by accounting_api through the gateway; used to pick inventory accounts for a zone. */
export const INVENTORY_ACCOUNTS_QUERY = gql`
  query storageInventoryAccounts {
    accounts(journals: ["inventory"], perPage: 200) { _id code name }
  }
`;

export const STORAGE_ZONE_SAVE = gql`
  mutation storageZoneSave($_id: String, $name: String!, $sealed: StorageZoneLocationInput!, $open: StorageZoneLocationInput!) {
    storageZoneSave(_id: $_id, name: $name, sealed: $sealed, open: $open) { _id }
  }
`;

export const STORAGE_ZONE_REMOVE = gql`
  mutation storageZoneRemove($_id: String!) {
    storageZoneRemove(_id: $_id)
  }
`;

export const STORAGE_RFID_TAGS_REGISTER = gql`
  mutation storageRfidTagsRegister($productId: String!, $zoneId: String!, $unitsInPack: Int!, $count: Int, $epcIds: [String!]) {
    storageRfidTagsRegister(productId: $productId, zoneId: $zoneId, unitsInPack: $unitsInPack, count: $count, epcIds: $epcIds) {
      batchId count epcIds
    }
  }
`;

export const STORAGE_BREAK_BOXES = gql`
  mutation storageBreakBoxes($epcIds: [String!]!, $requestKey: String) {
    storageBreakBoxes(epcIds: $epcIds, requestKey: $requestKey) { _id number accountingStatus }
  }
`;

export const STORAGE_RFID_SCAN_SUBMIT = gql`
  mutation storageRfidScanSubmit($zoneId: String!, $epcIds: [String!]!) {
    storageRfidScanSubmit(zoneId: $zoneId, epcIds: $epcIds) { ${SCAN_FIELDS} }
  }
`;

export const STORAGE_MOVEMENT_RETRY = gql`
  mutation storageMovementRetryAccounting($_id: String!) {
    storageMovementRetryAccounting(_id: $_id) { _id accountingStatus }
  }
`;
