export interface IProductRef {
  _id: string;
  name?: string | null;
  code?: string | null;
}

export interface IStructureRef {
  _id: string;
  title?: string | null;
  code?: string | null;
}

export interface IZoneLocation {
  accountId: string;
  branchId: string;
  departmentId: string;
  branch?: IStructureRef | null;
  department?: IStructureRef | null;
}

export type ZoneLocationInput = Pick<IZoneLocation, 'accountId' | 'branchId' | 'departmentId'>;

export interface IStorageZone {
  _id: string;
  name: string;
  sealed: IZoneLocation;
  open: IZoneLocation;
}

export interface IRfidTag {
  _id: string;
  epcId: string;
  productId: string;
  product?: IProductRef | null;
  unitsInPack: number;
  status: 'SEALED' | 'OPENED';
  createdAt?: string | null;
}

export interface IRfidSummaryRow {
  productId: string;
  product?: IProductRef | null;
  sealedPacks: number;
  sealedUnits: number;
  openedPacks: number;
}

export interface IStorageMovement {
  _id: string;
  number: string;
  date: string;
  items: { productId: string; product?: IProductRef | null; quantity: number; epcIds: string[] }[];
  accountingStatus: 'pending' | 'success' | 'error';
  accountingResponse?: string | null;
}

export interface IScanSession {
  _id: string;
  scannedCount: number;
  matchedCount: number;
  missingCount: number;
  unknownCount: number;
  openedCount: number;
  otherZoneCount: number;
  missingEpcIds: string[];
  unknownEpcIds: string[];
  openedEpcIds: string[];
  otherZoneEpcIds: string[];
  products: { productId: string; product?: IProductRef | null; expectedPacks: number; scannedPacks: number }[];
  createdAt?: string | null;
}

export interface IAccountOption {
  _id: string;
  code: string;
  name: string;
}

export interface IZonesQueryResult {
  storageZones: IStorageZone[];
}

export interface ITagsQueryResult {
  storageRfidTags: { list: IRfidTag[]; totalCount: number };
}

export interface ISummaryQueryResult {
  storageRfidSummary: IRfidSummaryRow[];
}

export interface IMovementsQueryResult {
  storageMovements: IStorageMovement[];
}

export interface IScanSessionsQueryResult {
  storageScanSessions: IScanSession[];
}

export interface IScanSubmitResult {
  storageRfidScanSubmit: IScanSession;
}

export interface IRegisterResult {
  storageRfidTagsRegister: { batchId: string; count: number; epcIds: string[] };
}

export interface IAccountsQueryResult {
  accounts: IAccountOption[];
}
