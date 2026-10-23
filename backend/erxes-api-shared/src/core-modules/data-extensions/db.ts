import { Connection, Model, Schema } from 'mongoose';
import { mongooseStringRandomId } from '../../utils/mongo/mongoose-types';
import {
  DATA_EXTENSION_FIELD_STATUSES,
  DATA_EXTENSION_FIELD_TYPES,
  DATA_EXTENSION_FIELDS_COLLECTION,
  DATA_EXTENSION_RELATION_KINDS,
  DATA_EXTENSION_SCHEMA_VERSION_ID,
  DATA_EXTENSION_SCHEMA_VERSIONS_COLLECTION,
} from './constants';
import {
  IDataExtensionFieldDocument,
  IDataExtensionSchemaVersionDocument,
  IDataExtensionSnapshot,
} from './types';

const fieldRelationSchema = new Schema(
  {
    targetRecordType: { type: String, required: true },
    kind: {
      type: String,
      required: true,
      enum: DATA_EXTENSION_RELATION_KINDS,
    },
    side: { type: String, required: true, enum: ['source', 'inverse'] },
    inverseFieldId: { type: String },
  },
  { _id: false },
);

const fieldOptionSchema = new Schema(
  {
    value: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false },
);

export const dataExtensionFieldSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    recordType: { type: String, required: true },
    key: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      required: true,
      enum: DATA_EXTENSION_FIELD_TYPES,
    },
    options: { type: [fieldOptionSchema], default: undefined },
    relation: { type: fieldRelationSchema, default: undefined },
    order: { type: Number, default: 0 },
    status: {
      type: String,
      required: true,
      enum: Object.values(DATA_EXTENSION_FIELD_STATUSES),
      default: DATA_EXTENSION_FIELD_STATUSES.ACTIVE,
    },
    createdBy: { type: String },
    updatedBy: { type: String },
    /** `<storage>:<key>` for every storage the field writes to. */
    storageKeys: { type: [String], default: undefined },
  },
  { timestamps: true },
);

// Archived fields keep their key: stored values still use it.
dataExtensionFieldSchema.index({ recordType: 1, key: 1 }, { unique: true });
// Record types sharing a document share its namespace. The multikey unique
// index makes the key reservation atomic across them, even under
// concurrent creates.
dataExtensionFieldSchema.index(
  { storageKeys: 1 },
  {
    unique: true,
    partialFilterExpression: { storageKeys: { $exists: true } },
  },
);
dataExtensionFieldSchema.index({ recordType: 1, status: 1, order: 1 });

export const dataExtensionSchemaVersionSchema = new Schema(
  {
    _id: { type: String },
    version: { type: Number, required: true, default: 0 },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export type IDataExtensionFieldModel = Model<IDataExtensionFieldDocument>;
export type IDataExtensionSchemaVersionModel =
  Model<IDataExtensionSchemaVersionDocument>;

export interface IDataExtensionModels {
  DataExtensionFields: IDataExtensionFieldModel;
  DataExtensionSchemaVersions: IDataExtensionSchemaVersionModel;
}

/**
 * Metadata models on a tenant connection. Core owns the writes; owners and
 * the runtime read through the same definitions.
 */
export const getDataExtensionModels = (
  connection: Connection,
): IDataExtensionModels => ({
  DataExtensionFields:
    (connection.models[
      DATA_EXTENSION_FIELDS_COLLECTION
    ] as IDataExtensionFieldModel) ||
    connection.model<IDataExtensionFieldDocument>(
      DATA_EXTENSION_FIELDS_COLLECTION,
      dataExtensionFieldSchema,
    ),
  DataExtensionSchemaVersions:
    (connection.models[
      DATA_EXTENSION_SCHEMA_VERSIONS_COLLECTION
    ] as IDataExtensionSchemaVersionModel) ||
    connection.model<IDataExtensionSchemaVersionDocument>(
      DATA_EXTENSION_SCHEMA_VERSIONS_COLLECTION,
      dataExtensionSchemaVersionSchema,
    ),
});

export const getDataExtensionSchemaVersion = async (
  models: IDataExtensionModels,
): Promise<number> => {
  const current = await models.DataExtensionSchemaVersions.findById(
    DATA_EXTENSION_SCHEMA_VERSION_ID,
  )
    .select('version')
    .lean();

  return current?.version || 0;
};

export const bumpDataExtensionSchemaVersion = async (
  models: IDataExtensionModels,
): Promise<number> => {
  const updated = await models.DataExtensionSchemaVersions.findOneAndUpdate(
    { _id: DATA_EXTENSION_SCHEMA_VERSION_ID },
    { $inc: { version: 1 } },
    { new: true, upsert: true },
  ).lean();

  return updated?.version || 0;
};

export const getActiveDataExtensionFields = async (
  models: IDataExtensionModels,
  recordTypes?: string[],
): Promise<IDataExtensionFieldDocument[]> => {
  const filter: Record<string, unknown> = {
    status: DATA_EXTENSION_FIELD_STATUSES.ACTIVE,
  };

  if (recordTypes) {
    filter.recordType = { $in: recordTypes };
  }

  return models.DataExtensionFields.find(filter)
    .sort({ recordType: 1, order: 1, createdAt: 1 })
    .lean<IDataExtensionFieldDocument[]>();
};

const SNAPSHOT_ATTEMPTS = 3;

/**
 * Reads active definitions together with the version they belong to. A
 * publish between the two version reads restarts the snapshot, so a schema
 * is never cached under a version whose fields it does not describe.
 */
export const loadDataExtensionSnapshot = async (
  models: IDataExtensionModels,
): Promise<IDataExtensionSnapshot> => {
  for (let attempt = 0; attempt < SNAPSHOT_ATTEMPTS; attempt++) {
    const before = await getDataExtensionSchemaVersion(models);
    const fields = await getActiveDataExtensionFields(models);
    const after = await getDataExtensionSchemaVersion(models);

    if (before === after) {
      return { version: after, fields };
    }
  }

  throw new Error('Data Extensions metadata is changing; retry the request');
};
