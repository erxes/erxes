import { Connection, Model, Schema } from 'mongoose';

export interface IStorageItem {
  sku: string;
  barcode?: string;
  name: string;
  nickname?: string;
  itemType: 'INVENTORY' | 'TOOL_ASSET' | 'FIXED_ASSET';
  costCenter: { company: string; branch: string; department: string };
  useRfid: boolean;
  packSize: number;
  avgCost: number;
  sealedPacks: number;
  openUnits: number;
  pendingPrUsers: string[];
}

export const storageItemSchema = new Schema<IStorageItem>(
  {
    sku: { type: String, required: true, unique: true, index: true },
    barcode: { type: String },
    name: { type: String, required: true },
    nickname: { type: String },
    itemType: { type: String, enum: ['INVENTORY', 'TOOL_ASSET', 'FIXED_ASSET'], default: 'INVENTORY' },
    costCenter: {
      company: { type: String, required: true },
      branch: { type: String, required: true },
      department: { type: String, required: true },
    },
    useRfid: { type: Boolean, default: false },
    packSize: { type: Number, default: 1, min: 1 },
    avgCost: { type: Number, default: 0, min: 0 },
    sealedPacks: { type: Number, default: 0, min: 0 },
    openUnits: { type: Number, default: 0, min: 0 },
    pendingPrUsers: { type: [String], default: [] },
  },
  { timestamps: true }
);

export interface IRfidTag {
  epcId: string;
  itemId: string;
  unitsInPack: number;
  tagCost: number;
  zoneStatus: 'SEALED' | 'OPENED' | 'ISSUED';
}

export const rfidTagSchema = new Schema<IRfidTag>(
  {
    epcId: { type: String, required: true, unique: true, maxlength: 98 },
    itemId: { type: String, required: true, index: true },
    unitsInPack: { type: Number, required: true },
    tagCost: { type: Number, default: 175 },
    zoneStatus: { type: String, enum: ['SEALED', 'OPENED', 'ISSUED'], default: 'SEALED' },
  },
  { timestamps: true }
);

export interface ITechCard {
  name: string;
  kitItemId: string;
  components: { itemId: string; qty: number }[];
}

export const techCardSchema = new Schema<ITechCard>(
  {
    name: { type: String, required: true },
    kitItemId: { type: String, required: true, index: true },
    components: [{ itemId: { type: String, required: true }, qty: { type: Number, required: true, min: 1 } }],
  },
  { timestamps: true }
);

export interface IWorkOrderCostLine {
  _id?: string;
  date: Date;
  category: 'MATERIAL' | 'LABOR' | 'OVERHEAD';
  taxCode: string;
  itemId?: string;
  description: string;
  qty: number;
  unitCost: number;
  totalAmount: number;
  closedAmount: number;
  directDrop: boolean;
}

export interface IWorkOrder {
  code: string;
  name: string;
  clientName: string;
  contractNo?: string;
  costCenter: { company: string; branch: string; department: string };
  status: 'ACTIVE' | 'CLOSED';
  costLines: IWorkOrderCostLine[];
}

export const workOrderSchema = new Schema<IWorkOrder>(
  {
    code: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    clientName: { type: String, required: true },
    contractNo: { type: String },
    costCenter: {
      company: { type: String, required: true },
      branch: { type: String, required: true },
      department: { type: String, required: true },
    },
    status: { type: String, enum: ['ACTIVE', 'CLOSED'], default: 'ACTIVE' },
    costLines: [
      {
        date: { type: Date, default: Date.now },
        category: { type: String, enum: ['MATERIAL', 'LABOR', 'OVERHEAD'], required: true },
        taxCode: { type: String, required: true },
        itemId: { type: String },
        description: { type: String, required: true },
        qty: { type: Number, default: 1 },
        unitCost: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        closedAmount: { type: Number, default: 0 },
        directDrop: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export interface IToolAsset {
  assetCode: string;
  name: string;
  serialNo: string;
  cost: number;
  finLifeYears: number;
  taxLifeYears: number;
  monthsUsed: number;
  status: 'IN_WAREHOUSE' | 'PENDING_HANDOVER' | 'IN_USE' | 'IN_REPAIR' | 'WRITTEN_OFF';
  custodianName: string;
  pendingCustodian?: string | null;
  workOrderCode?: string | null;
  repairExpense: number;
}

export const toolAssetSchema = new Schema<IToolAsset>(
  {
    assetCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    serialNo: { type: String, required: true },
    cost: { type: Number, required: true },
    finLifeYears: { type: Number, default: 5 },
    taxLifeYears: { type: Number, default: 10 },
    monthsUsed: { type: Number, default: 0 },
    status: { type: String, enum: ['IN_WAREHOUSE', 'PENDING_HANDOVER', 'IN_USE', 'IN_REPAIR', 'WRITTEN_OFF'], default: 'IN_WAREHOUSE' },
    custodianName: { type: String, required: true },
    pendingCustodian: { type: String, default: null },
    workOrderCode: { type: String, default: null },
    repairExpense: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export interface IVatPayable {
  vendorTin: string;
  vendorName: string;
  amount: number;
  vatAmount: number;
  isPaid: boolean;
  status: 'UNMATCHED' | 'MATCHED';
  matchedGroupId?: string | null;
}

export const vatPayableSchema = new Schema<IVatPayable>(
  {
    vendorTin: { type: String, required: true, index: true },
    vendorName: { type: String, required: true },
    amount: { type: Number, required: true },
    vatAmount: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    status: { type: String, enum: ['UNMATCHED', 'MATCHED'], default: 'UNMATCHED' },
    matchedGroupId: { type: String, default: null },
  },
  { timestamps: true }
);

export interface IEBarimtReceipt {
  receiptNo: string;
  vendorTin: string;
  vendorName: string;
  amount: number;
  vatAmount: number;
  status: 'UNMATCHED' | 'MATCHED';
  matchedGroupId?: string | null;
}

export const eBarimtReceiptSchema = new Schema<IEBarimtReceipt>(
  {
    receiptNo: { type: String, required: true, unique: true },
    vendorTin: { type: String, required: true, index: true },
    vendorName: { type: String, required: true },
    amount: { type: Number, required: true },
    vatAmount: { type: Number, required: true },
    status: { type: String, enum: ['UNMATCHED', 'MATCHED'], default: 'UNMATCHED' },
    matchedGroupId: { type: String, default: null },
  },
  { timestamps: true }
);

export interface IPeriodClose {
  closedUntil: Date;
  closedBy: string;
  status: 'CLOSED' | 'REOPENED';
}

export const periodCloseSchema = new Schema<IPeriodClose>(
  {
    closedUntil: { type: Date, required: true },
    closedBy: { type: String, required: true },
    status: { type: String, enum: ['CLOSED', 'REOPENED'], default: 'CLOSED' },
  },
  { timestamps: true }
);

export interface IModels {
  StorageItems: Model<IStorageItem>;
  RfidTags: Model<IRfidTag>;
  TechCards: Model<ITechCard>;
  WorkOrders: Model<IWorkOrder>;
  ToolAssets: Model<IToolAsset>;
  VatPayables: Model<IVatPayable>;
  EBarimtReceipts: Model<IEBarimtReceipt>;
  PeriodCloses: Model<IPeriodClose>;
}

export const loadClasses = (db: Connection): IModels => ({
  StorageItems: db.model<IStorageItem>('storage_items', storageItemSchema),
  RfidTags: db.model<IRfidTag>('storage_rfid_tags', rfidTagSchema),
  TechCards: db.model<ITechCard>('storage_tech_cards', techCardSchema),
  WorkOrders: db.model<IWorkOrder>('storage_work_orders', workOrderSchema),
  ToolAssets: db.model<IToolAsset>('storage_tool_assets', toolAssetSchema),
  VatPayables: db.model<IVatPayable>('storage_vat_payables', vatPayableSchema),
  EBarimtReceipts: db.model<IEBarimtReceipt>('storage_ebarimt_receipts', eBarimtReceiptSchema),
  PeriodCloses: db.model<IPeriodClose>('storage_period_closes', periodCloseSchema),
});
