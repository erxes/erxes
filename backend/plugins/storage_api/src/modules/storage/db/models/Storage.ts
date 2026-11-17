import { EventDispatcherReturn, ScopedEventHandlers } from 'erxes-api-shared/core-modules';
import { Connection, Model, Schema } from 'mongoose';
import {
  IRfidTag,
  IScanSession,
  IStorageMovement,
  IStorageZone,
  IZoneLocation,
} from '../../@types/storage';

const zoneLocationSchema = new Schema<IZoneLocation>(
  {
    accountId: { type: String, required: true },
    branchId: { type: String, required: true },
    departmentId: { type: String, required: true },
  },
  { _id: false },
);

const zoneSchema = new Schema<IStorageZone>(
  {
    name: { type: String, required: true, unique: true },
    sealed: { type: zoneLocationSchema, required: true },
    open: { type: zoneLocationSchema, required: true },
  },
  { timestamps: true },
);

const rfidTagSchema = new Schema<IRfidTag>(
  {
    epcId: { type: String, required: true, unique: true, match: /^[0-9A-F]{24}$/ },
    productId: { type: String, required: true },
    unitsInPack: { type: Number, required: true, min: 1 },
    zoneId: { type: String, required: true },
    status: { type: String, enum: ['SEALED', 'OPENED'], default: 'SEALED' },
    batchId: { type: String, index: true },
    movementId: { type: String, index: true },
    createdBy: { type: String },
  },
  { timestamps: true },
);
rfidTagSchema.index({ zoneId: 1, status: 1, productId: 1 });

const movementSchema = new Schema<IStorageMovement>(
  {
    requestKey: { type: String, required: true, unique: true },
    type: { type: String, enum: ['BREAK_BOX'], required: true },
    number: { type: String, required: true },
    date: { type: Date, required: true },
    zoneId: { type: String, required: true },
    source: { type: zoneLocationSchema, required: true },
    destination: { type: zoneLocationSchema, required: true },
    items: [
      {
        _id: false,
        productId: { type: String, required: true },
        quantity: { type: Number, required: true, min: 0 },
        epcIds: { type: [String], default: [] },
      },
    ],
    userId: { type: String },
    accountingStatus: { type: String, enum: ['pending', 'success', 'error'], default: 'pending' },
    accountingResponse: { type: String },
  },
  { timestamps: true },
);
movementSchema.index({ createdAt: -1 });
movementSchema.index({ accountingStatus: 1, createdAt: -1 });

const scanSessionSchema = new Schema<IScanSession>(
  {
    zoneId: { type: String, required: true },
    scannedCount: { type: Number, required: true },
    matchedCount: { type: Number, required: true },
    missingCount: { type: Number, required: true },
    unknownCount: { type: Number, required: true },
    openedCount: { type: Number, required: true },
    otherZoneCount: { type: Number, required: true },
    missingEpcIds: { type: [String], default: [] },
    unknownEpcIds: { type: [String], default: [] },
    openedEpcIds: { type: [String], default: [] },
    otherZoneEpcIds: { type: [String], default: [] },
    products: [
      {
        _id: false,
        productId: { type: String, required: true },
        expectedPacks: { type: Number, required: true },
        scannedPacks: { type: Number, required: true },
      },
    ],
    userId: { type: String },
  },
  { timestamps: true },
);
scanSessionSchema.index({ zoneId: 1, createdAt: -1 });

export interface IMovementModel extends Model<IStorageMovement> {
  /** Tells other plugins (accounting afterProcess) that a movement was created. */
  publishCreated(movementId: string): Promise<void>;
}

const loadMovementClass = ({ sendDbEventLog }: EventDispatcherReturn) => {
  class MovementClass {
    public static async publishCreated(this: IMovementModel, movementId: string) {
      const movement = await this.findById(movementId).lean();
      if (!movement) return;

      sendDbEventLog({
        action: 'create',
        docId: String(movement._id),
        currentDocument: { ...movement, _id: String(movement._id) },
      });
    }
  }

  // Clone so each tenant's model keeps its own dispatcher.
  const schema = movementSchema.clone();
  schema.loadClass(MovementClass);
  return schema;
};

export interface IModels {
  Zones: Model<IStorageZone>;
  RfidTags: Model<IRfidTag>;
  Movements: IMovementModel;
  ScanSessions: Model<IScanSession>;
}

export const loadClasses = (
  db: Connection,
  _subdomain: string,
  eventHandlers: ScopedEventHandlers,
): IModels => {
  const storageEventHandlers = eventHandlers('storage');

  return {
    Zones: db.model<IStorageZone>('storage_zones', zoneSchema),
    RfidTags: db.model<IRfidTag>('storage_rfid_tags', rfidTagSchema),
    Movements: db.model<IStorageMovement, IMovementModel>(
      'storage_movements',
      loadMovementClass(storageEventHandlers('storage', 'movements')),
    ),
    ScanSessions: db.model<IScanSession>('storage_scan_sessions', scanSessionSchema),
  };
};
