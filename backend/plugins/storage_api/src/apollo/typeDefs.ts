import gql from 'graphql-tag';
import { apolloCommonTypes } from 'erxes-api-shared/utils';

export const typeDefs = async () => gql`
  ${apolloCommonTypes}

  type StorageCostCenter {
    company: String!
    branch: String!
    department: String!
  }

  input StorageCostCenterInput {
    company: String!
    branch: String!
    department: String!
  }

  type StorageItem {
    _id: String!
    sku: String!
    barcode: String
    name: String!
    nickname: String
    itemType: String!
    costCenter: StorageCostCenter!
    useRfid: Boolean!
    packSize: Int!
    avgCost: Float!
    sealedPacks: Int!
    openUnits: Int!
  }

  type StorageRfidScanRow {
    itemId: String!
    sku: String!
    name: String!
    systemPacks: Int!
    scannedPacks: Int!
    openUnits: Int!
    sampleEpc98: String
  }

  type StorageWorkOrderCostLine {
    _id: String!
    date: Date
    category: String!
    taxCode: String!
    description: String!
    qty: Float!
    unitCost: Float!
    totalAmount: Float!
    closedAmount: Float!
    directDrop: Boolean!
  }

  type StorageWorkOrder {
    _id: String!
    code: String!
    name: String!
    clientName: String!
    contractNo: String
    status: String!
    costLines: [StorageWorkOrderCostLine!]!
  }

  type StorageToolAsset {
    _id: String!
    assetCode: String!
    name: String!
    serialNo: String!
    cost: Float!
    finLifeYears: Int!
    taxLifeYears: Int!
    monthsUsed: Int!
    status: String!
    custodianName: String!
    pendingCustodian: String
    workOrderCode: String
    repairExpense: Float!
  }

  type StorageVatPayable {
    _id: String!
    vendorTin: String!
    vendorName: String!
    amount: Float!
    vatAmount: Float!
    isPaid: Boolean!
    status: String!
    matchedGroupId: String
  }

  type StorageEBarimtReceipt {
    _id: String!
    receiptNo: String!
    vendorTin: String!
    vendorName: String!
    amount: Float!
    vatAmount: Float!
    status: String!
    matchedGroupId: String
  }

  type StorageIssueResult {
    item: StorageItem!
    docNo: String!
  }

  type StorageReceiveResult {
    item: StorageItem!
    notifiedUsers: [String!]!
  }

  extend type Query {
    storageItems(company: String): [StorageItem!]!
    storageRfidScan: [StorageRfidScanRow!]!
    storageWorkOrders: [StorageWorkOrder!]!
    storageToolAssets: [StorageToolAsset!]!
    storageVatPayables: [StorageVatPayable!]!
    storageEBarimtReceipts: [StorageEBarimtReceipt!]!
  }

  extend type Mutation {
    storageItemCreate(sku: String!, name: String!, nickname: String, itemType: String!, useRfid: Boolean!, packSize: Int!, avgCost: Float!, costCenter: StorageCostCenterInput!): StorageItem!
    storageReceiveStock(itemId: String!, sealedPacks: Int!, openUnits: Int!): StorageReceiveResult!
    storageBreakSealedBox(itemId: String!): StorageItem!
    storageIssueStock(itemId: String!, qty: Int!, workOrderCode: String, taxCode: String, directDrop: Boolean, autoConvert: Boolean): StorageIssueResult!
    storageWorkOrderClosePercent(workOrderId: String!, percent: Float!): StorageWorkOrder!
    storageWorkOrderReopenLine(workOrderId: String!, costLineId: String!): StorageWorkOrder!
    storageToolInitiateHandover(toolId: String!, toCustodian: String!, workOrderCode: String): StorageToolAsset!
    storageToolAcceptHandover(toolId: String!): StorageToolAsset!
    storageToolSendToRepair(toolId: String!, fee: Float!): StorageToolAsset!
    storageVatAutoReconcile: Int!
    storageVatManualReconcile(payableIds: [String!]!, receiptId: String!): String!
    storagePeriodClose(closedUntil: Date!): Boolean!
  }
`;
