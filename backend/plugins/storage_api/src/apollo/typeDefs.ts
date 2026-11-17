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
    openUnits: Float!
  }

  type StorageRfidScanRow {
    itemId: String!
    sku: String!
    name: String!
    systemPacks: Int!
    scannedPacks: Int!
    openUnits: Float!
    sampleEpc: String
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
    inServiceDate: Date
    monthsUsed: Int!
    status: String!
    custodianName: String!
    pendingCustodian: String
    pendingToWarehouse: Boolean
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

  type StoragePeriodClose {
    _id: String!
    closedUntil: Date!
    closedBy: String!
    status: String!
    reopenedBy: String
    createdAt: Date
  }

  extend type Query {
    storageItems(company: String): [StorageItem!]!
    storageRfidScan: [StorageRfidScanRow!]!
    storageWorkOrders: [StorageWorkOrder!]!
    storageToolAssets: [StorageToolAsset!]!
    storageVatPayables: [StorageVatPayable!]!
    storageEBarimtReceipts: [StorageEBarimtReceipt!]!
    storagePeriodCloses: [StoragePeriodClose!]!
  }

  # requestKey: client-generated unique key (e.g. a UUID per button press).
  # Retrying with the same key returns the original result instead of applying the change twice.
  extend type Mutation {
    storageItemCreate(sku: String!, name: String!, nickname: String, itemType: String!, useRfid: Boolean!, packSize: Int!, avgCost: Float!, costCenter: StorageCostCenterInput!): StorageItem!
    storageReceiveStock(itemId: String!, sealedPacks: Int!, openUnits: Float!, txDate: Date, requestKey: String): StorageReceiveResult!
    storageBreakSealedBox(itemId: String!, epcId: String, txDate: Date, requestKey: String): StorageItem!
    storageIssueStock(itemId: String!, qty: Float!, workOrderCode: String, taxCode: String, directDrop: Boolean, autoConvert: Boolean, txDate: Date, requestKey: String): StorageIssueResult!
    storageWorkOrderClosePercent(workOrderId: String!, percent: Float!, requestKey: String): StorageWorkOrder!
    storageWorkOrderReopenLine(workOrderId: String!, costLineId: String!, requestKey: String): StorageWorkOrder!
    storageToolInitiateHandover(toolId: String!, toCustodian: String, toWarehouse: Boolean, workOrderCode: String): StorageToolAsset!
    storageToolAcceptHandover(toolId: String!): StorageToolAsset!
    storageToolSendToRepair(toolId: String!, fee: Float!, txDate: Date, requestKey: String): StorageToolAsset!
    storageVatAutoReconcile: Int!
    storageVatManualReconcile(payableIds: [String!]!, receiptId: String!): String!
    storagePeriodClose(closedUntil: Date!): StoragePeriodClose!
    storagePeriodReopen(closeId: String!): StoragePeriodClose!
  }
`;
