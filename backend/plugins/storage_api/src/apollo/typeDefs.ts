import gql from 'graphql-tag';
import { apolloCommonTypes } from 'erxes-api-shared/utils';

export const typeDefs = async () => gql`
  ${apolloCommonTypes}

  extend type Product @key(fields: "_id") {
    _id: String! @external
  }

  extend type Branch @key(fields: "_id") {
    _id: String @external
  }

  extend type Department @key(fields: "_id") {
    _id: String @external
  }

  type StorageZoneLocation {
    accountId: String!
    branchId: String!
    departmentId: String!
    branch: Branch
    department: Department
  }

  type StorageZone {
    _id: String!
    name: String!
    sealed: StorageZoneLocation!
    open: StorageZoneLocation!
  }

  type StorageRfidTag {
    _id: String!
    epcId: String!
    productId: String!
    product: Product
    unitsInPack: Int!
    zoneId: String!
    status: String!
    movementId: String
    createdAt: Date
  }

  type StorageRfidTagList {
    list: [StorageRfidTag!]!
    totalCount: Int!
  }

  type StorageRfidSummaryRow {
    productId: String!
    product: Product
    sealedPacks: Int!
    sealedUnits: Float!
    openedPacks: Int!
  }

  type StorageRfidRegisterResult {
    batchId: String!
    count: Int!
    epcIds: [String!]!
  }

  type StorageMovementItem {
    productId: String!
    product: Product
    quantity: Float!
    epcIds: [String!]!
  }

  type StorageMovement {
    _id: String!
    type: String!
    number: String!
    date: Date!
    zoneId: String!
    source: StorageZoneLocation!
    destination: StorageZoneLocation!
    items: [StorageMovementItem!]!
    userId: String
    accountingStatus: String!
    accountingResponse: String
    createdAt: Date
  }

  type StorageScanProductRow {
    productId: String!
    product: Product
    expectedPacks: Int!
    scannedPacks: Int!
  }

  type StorageScanSession {
    _id: String!
    zoneId: String!
    scannedCount: Int!
    matchedCount: Int!
    missingCount: Int!
    unknownCount: Int!
    openedCount: Int!
    otherZoneCount: Int!
    missingEpcIds: [String!]!
    unknownEpcIds: [String!]!
    openedEpcIds: [String!]!
    otherZoneEpcIds: [String!]!
    products: [StorageScanProductRow!]!
    userId: String
    createdAt: Date
  }

  input StorageZoneLocationInput {
    accountId: String!
    branchId: String!
    departmentId: String!
  }

  extend type Query {
    storageZones: [StorageZone!]!
    storageRfidTags(zoneId: String, productId: String, status: String, page: Int, perPage: Int): StorageRfidTagList!
    storageRfidSummary(zoneId: String!): [StorageRfidSummaryRow!]!
    storageMovements(accountingStatus: String, page: Int, perPage: Int): [StorageMovement!]!
    storageScanSessions(zoneId: String!, limit: Int): [StorageScanSession!]!
  }

  # requestKey: client-generated unique key (a UUID per user action).
  # Retrying with the same key returns the first movement instead of creating another.
  extend type Mutation {
    storageZoneSave(_id: String, name: String!, sealed: StorageZoneLocationInput!, open: StorageZoneLocationInput!): StorageZone!
    storageZoneRemove(_id: String!): String!
    storageRfidTagsRegister(productId: String!, zoneId: String!, unitsInPack: Int!, count: Int, epcIds: [String!]): StorageRfidRegisterResult!
    storageRfidTagsRemove(epcIds: [String!]!): Int!
    storageBreakBoxes(epcIds: [String!]!, requestKey: String): StorageMovement!
    storageRfidScanSubmit(zoneId: String!, epcIds: [String!]!): StorageScanSession!
    storageMovementRetryAccounting(_id: String!): StorageMovement!
  }
`;
