export interface IStorageCostCenter {
  company: string;
  branch: string;
  department: string;
}

export interface IStorageItem {
  _id: string;
  sku: string;
  barcode?: string | null;
  name: string;
  nickname?: string | null;
  itemType: string;
  useRfid: boolean;
  packSize: number;
  avgCost: number;
  sealedPacks: number;
  openUnits: number;
  costCenter: IStorageCostCenter;
}

export interface IStorageRfidScanRow {
  itemId: string;
  sku: string;
  name: string;
  systemPacks: number;
  scannedPacks: number;
  openUnits: number;
  sampleEpc?: string | null;
}

export interface IStorageCostLine {
  _id: string;
  date: string;
  category: string;
  taxCode: string;
  description: string;
  qty: number;
  unitCost: number;
  totalAmount: number;
  closedAmount: number;
  directDrop: boolean;
}

export interface IStorageWorkOrder {
  _id: string;
  code: string;
  name: string;
  clientName: string;
  contractNo: string;
  status: string;
  costLines: IStorageCostLine[];
}

export interface IStorageToolAsset {
  _id: string;
  assetCode: string;
  name: string;
  serialNo: string;
  cost: number;
  finLifeYears: number;
  taxLifeYears: number;
  inServiceDate?: string | null;
  monthsUsed: number;
  status: string;
  custodianName: string;
  pendingCustodian?: string | null;
  pendingToWarehouse?: boolean | null;
  workOrderCode?: string | null;
  repairExpense: number;
}

export interface IStorageVatPayable {
  _id: string;
  vendorTin: string;
  vendorName: string;
  amount: number;
  vatAmount: number;
  isPaid: boolean;
  status: string;
  matchedGroupId?: string | null;
}

export interface IStorageEBarimtReceipt {
  _id: string;
  receiptNo: string;
  vendorTin: string;
  vendorName: string;
  amount: number;
  vatAmount: number;
  status: string;
  matchedGroupId?: string | null;
}

export interface IStorageItemsQueryResult {
  storageItems: IStorageItem[];
}

export interface IStorageRfidScanQueryResult {
  storageRfidScan: IStorageRfidScanRow[];
}

export interface IStorageWorkOrdersQueryResult {
  storageWorkOrders: IStorageWorkOrder[];
}

export interface IStorageToolAssetsQueryResult {
  storageToolAssets: IStorageToolAsset[];
}

export interface IStorageVatDataQueryResult {
  storageVatPayables: IStorageVatPayable[];
  storageEBarimtReceipts: IStorageEBarimtReceipt[];
}

export interface IStorageIssueStockResult {
  storageIssueStock: {
    docNo: string;
    item: Pick<IStorageItem, '_id' | 'name' | 'nickname' | 'sku' | 'avgCost' | 'sealedPacks' | 'openUnits'>;
  };
}

export interface IStorageIssueStockVariables {
  itemId: string;
  qty: number;
  workOrderCode?: string;
  taxCode?: string;
  directDrop?: boolean;
  autoConvert?: boolean;
  requestKey?: string;
}
