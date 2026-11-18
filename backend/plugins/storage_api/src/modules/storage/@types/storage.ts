import { Document } from 'mongoose';

/** One accounting location: an inventory account at a branch and department. */
export interface IZoneLocation {
  accountId: string;
  branchId: string;
  departmentId: string;
}

/**
 * A warehouse split in two accounting locations: sealed packs counted by RFID
 * antenna, and the open (broken-pack) area counted by hand.
 */
export interface IStorageZone {
  name: string;
  sealed: IZoneLocation;
  open: IZoneLocation;
}

export interface IStorageZoneDocument extends IStorageZone, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RfidTagStatus = 'SEALED' | 'OPENED';

export interface IRfidTag {
  epcId: string;
  productId: string;
  unitsInPack: number;
  zoneId: string;
  status: RfidTagStatus;
  batchId?: string;
  movementId?: string;
  createdBy?: string;
}

export interface IRfidTagDocument extends IRfidTag, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type StorageMovementType = 'BREAK_BOX';

export type AccountingStatus = 'pending' | 'success' | 'error';

export interface IStorageMovementItem {
  productId: string;
  /** Units moved (packs × unitsInPack). */
  quantity: number;
  epcIds: string[];
}

/**
 * A stock movement decided in storage. Storage never keeps stock counts or
 * cost: it sends the movement to accounting_api over tRPC as one inventory-move
 * transaction and stores accounting's answer here.
 */
export interface IStorageMovement {
  requestKey: string;
  type: StorageMovementType;
  number: string;
  date: Date;
  zoneId: string;
  source: IZoneLocation;
  destination: IZoneLocation;
  items: IStorageMovementItem[];
  userId?: string;
  accountingStatus: AccountingStatus;
  accountingResponse?: string;
  /** Parent id of the accounting transaction, once booked. */
  accountingTrId?: string;
}

export interface IStorageMovementDocument extends IStorageMovement, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IScanProductRow {
  productId: string;
  expectedPacks: number;
  scannedPacks: number;
}

export interface IScanSession {
  zoneId: string;
  scannedCount: number;
  matchedCount: number;
  missingCount: number;
  unknownCount: number;
  openedCount: number;
  otherZoneCount: number;
  /** Samples are capped; the counts above are exact. */
  missingEpcIds: string[];
  unknownEpcIds: string[];
  openedEpcIds: string[];
  otherZoneEpcIds: string[];
  products: IScanProductRow[];
  userId?: string;
}

export interface IScanSessionDocument extends IScanSession, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
