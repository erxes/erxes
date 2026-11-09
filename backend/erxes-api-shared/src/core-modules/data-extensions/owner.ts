import { Model, Types } from 'mongoose';
import { DATA_EXTENSION_LIMITS, DATA_EXTENSIONS_NAMESPACE } from './constants';
import { getActiveDataExtensionFields, IDataExtensionModels } from './db';
import { getDataExtensionRecordType } from './recordTypes';
import {
  IDataExtensionField,
  IDataExtensionRecord,
  IDataExtensionRecordScope,
  IDataExtensionRecordType,
} from './types';
import {
  buildDataExtensionAggregateStages,
  buildDataExtensionRecordFilter,
  IDataExtensionFilter,
  IDataExtensionMetric,
} from './query';
import {
  buildDataExtensionPatch,
  DataExtensionValidationError,
  pickDataExtensionValues,
} from './validation';

type LeanRecord = Record<string, unknown> & { _id: unknown };

/** The part of an owner's Mongoose model this contract reads and writes. */
export interface IDataExtensionOwnerModel {
  /** Tenant connection; its name tells databases apart in shared caches. */
  db: { name: string };
  collection: Model<unknown>['collection'];
  find(
    filter: Record<string, unknown>,
    projection: Record<string, 1>,
  ): { lean<T>(): PromiseLike<T> };
}

/** One owner collection that can hold records of a record type. */
export interface IDataExtensionStorageAdapter {
  storage: string;
  model: IDataExtensionOwnerModel;
  /** Fills computed native fields such as a display name. */
  computeNative?: (doc: LeanRecord) => Record<string, unknown>;
  /** Paths `computeNative` reads that are not native fields themselves. */
  computedPaths?: string[];
  /** Records the owner treats as gone, such as merged-away contacts. */
  baseFilter?: Record<string, unknown>;
  /** Paths a name search matches; defaults to `name`. */
  searchPaths?: string[];
}

export interface IDataExtensionOwnerContext {
  metadata: IDataExtensionModels;
  /** Owner adapters keyed by storage id from the record type registry. */
  adapters: Record<string, IDataExtensionStorageAdapter>;
}

const READ_FIELDS_TTL_MS = 1000;
const READ_FIELDS_CACHE_MAX = 5000;
const readFieldsCache = new Map<
  string,
  { fields: IDataExtensionField[]; readAt: number }
>();

/**
 * Definitions used to shape read results, reused for a second per tenant
 * database and record type. Writes never use this: patches always validate
 * against the definitions active when they commit.
 */
const getFieldsForRead = async (
  metadata: IDataExtensionModels,
  recordType: string,
) => {
  const key = `${metadata.DataExtensionFields.db.name}:${recordType}`;
  const cached = readFieldsCache.get(key);

  if (cached && Date.now() - cached.readAt < READ_FIELDS_TTL_MS) {
    return cached.fields;
  }

  const fields = await getActiveDataExtensionFields(metadata, [recordType]);

  if (readFieldsCache.size >= READ_FIELDS_CACHE_MAX) {
    readFieldsCache.clear();
  }

  readFieldsCache.set(key, { fields, readAt: Date.now() });

  return fields;
};

const isObjectIdString = (id: string) => /^[a-f0-9]{24}$/i.test(id);

const castIds = (
  descriptor: IDataExtensionRecordType,
  ids: string[],
): (string | Types.ObjectId)[] => {
  if (descriptor.idKind === 'objectId') {
    return ids.filter(isObjectIdString).map((id) => new Types.ObjectId(id));
  }

  return ids.filter((id) => id.length > 0 && id.length <= 64);
};

export const buildDataExtensionScopeFilter = (
  scope?: IDataExtensionRecordScope,
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};

  if (scope?.customerStates?.length) {
    filter.state = { $in: scope.customerStates };
  }

  if (scope?.contactRoles?.length) {
    filter.contactRoles = { $in: scope.contactRoles };
  }

  return filter;
};

const isBsonValue = (value: object) =>
  '_bsontype' in value || value instanceof Types.ObjectId;

const serializeNativeValue = (value: unknown): unknown => {
  if (value === null || value === undefined) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(serializeNativeValue);
  }

  if (typeof value === 'object') {
    return isBsonValue(value) ? String(value) : null;
  }

  return value;
};

const serializeExtensionValue = (value: unknown): unknown =>
  value instanceof Date ? value.toISOString() : value;

const readPath = (doc: Record<string, unknown>, path: string): unknown =>
  path.split('.').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, doc);

const buildProjection = (
  descriptor: IDataExtensionRecordType,
  adapter: IDataExtensionStorageAdapter,
) => {
  const projection: Record<string, 1> = { [DATA_EXTENSIONS_NAMESPACE]: 1 };

  for (const field of descriptor.nativeFields) {
    if (!field.computed) {
      projection[field.path || field.name] = 1;
    }
  }

  for (const path of adapter.computedPaths || []) {
    projection[path] = 1;
  }

  return projection;
};

const resolveDescriptor = (
  recordType: string,
  owner: string,
): IDataExtensionRecordType => {
  const descriptor = getDataExtensionRecordType(recordType);

  if (!descriptor || descriptor.owner !== owner) {
    throw new DataExtensionValidationError(
      `Unsupported record type "${recordType}"`,
    );
  }

  return descriptor;
};

const resolveAdapters = (
  descriptor: IDataExtensionRecordType,
  context: IDataExtensionOwnerContext,
) =>
  descriptor.storages.map((storage) => {
    const adapter = context.adapters[storage];

    if (!adapter) {
      throw new Error(`No owner adapter for storage "${storage}"`);
    }

    return adapter;
  });

const toRecord = (
  descriptor: IDataExtensionRecordType,
  adapter: IDataExtensionStorageAdapter,
  doc: LeanRecord,
  activeKeys: { key: string }[],
): IDataExtensionRecord => {
  const computed = adapter.computeNative?.(doc) || {};
  const native: Record<string, unknown> = {};

  for (const field of descriptor.nativeFields) {
    native[field.name] = field.computed
      ? computed[field.name] ?? null
      : serializeNativeValue(readPath(doc, field.path || field.name));
  }

  const values = pickDataExtensionValues(
    doc[DATA_EXTENSIONS_NAMESPACE],
    activeKeys,
  );

  for (const key of Object.keys(values)) {
    values[key] = serializeExtensionValue(values[key]);
  }

  return { _id: String(doc._id), native, dataExtensions: values };
};

/**
 * Authorised owner lookup by id. The record type's scope is applied on the
 * server, so a lead id never resolves as a customer and a contact without
 * the vendor role never resolves as a vendor.
 */
export const getDataExtensionRecords = async (
  context: IDataExtensionOwnerContext,
  owner: string,
  recordType: string,
  ids: string[],
): Promise<IDataExtensionRecord[]> => {
  const descriptor = resolveDescriptor(recordType, owner);

  if (ids.length > DATA_EXTENSION_LIMITS.recordsPerLookup) {
    throw new DataExtensionValidationError(
      `At most ${DATA_EXTENSION_LIMITS.recordsPerLookup} records per lookup`,
    );
  }

  const castedIds = castIds(descriptor, Array.from(new Set(ids)));

  if (!castedIds.length) {
    return [];
  }

  const activeFields = await getFieldsForRead(context.metadata, recordType);
  const scopeFilter = buildDataExtensionScopeFilter(descriptor.scope);
  const found = new Map<string, IDataExtensionRecord>();

  for (const adapter of resolveAdapters(descriptor, context)) {
    const pending = castedIds.filter((id) => !found.has(String(id)));

    if (!pending.length) {
      break;
    }

    const docs = await adapter.model
      .find(
        { ...adapter.baseFilter, _id: { $in: pending }, ...scopeFilter },
        buildProjection(descriptor, adapter),
      )
      .lean<LeanRecord[]>();

    for (const doc of docs) {
      found.set(
        String(doc._id),
        toRecord(descriptor, adapter, doc, activeFields),
      );
    }
  }

  return ids
    .map((id) => found.get(id))
    .filter((record): record is IDataExtensionRecord => Boolean(record));
};

const relationPath = (key: string) => `${DATA_EXTENSIONS_NAMESPACE}.${key}`;

// Successful index builds per tenant database and collection. Failures are
// not remembered, so the next request retries them.
const ensuredIndexes = new Map<string, Promise<void>>();

const buildRelationIndex = (
  model: IDataExtensionOwnerModel,
  field: IDataExtensionField,
  unique: boolean,
) => {
  const path = relationPath(field.key);

  return model.collection
    .createIndex(
      { [path]: 1 },
      unique
        ? {
            name: `dataExtensions_${field.key}_unique`,
            unique: true,
            partialFilterExpression: { [path]: { $type: 'string' } },
          }
        : { name: `dataExtensions_${field.key}`, sparse: true },
    )
    .then(() => undefined);
};

/**
 * Relation links are queried from the target side, so the source path is
 * indexed the first time it is used, once per tenant database. One-to-one
 * links need their unique index: if it cannot be built (for example because
 * existing data already breaks uniqueness), the write is refused rather than
 * relying on a racy pre-check alone.
 */
const ensureRelationIndexes = async (
  adapters: IDataExtensionStorageAdapter[],
  field: IDataExtensionField,
) => {
  const unique = field.relation?.kind === 'oneToOne';

  // Keyed by the definition id too: a deleted and re-created key must get
  // its index again even if this process remembers the old one.
  const fieldId = String((field as { _id?: unknown })._id ?? '');

  for (const { model } of adapters) {
    const id = [
      model.db.name,
      model.collection.collectionName,
      field.key,
      fieldId,
      unique,
    ].join(':');
    let pending = ensuredIndexes.get(id);

    if (!pending) {
      pending = buildRelationIndex(model, field, unique).catch((error) => {
        ensuredIndexes.delete(id);
        throw error;
      });
      ensuredIndexes.set(id, pending);
    }

    try {
      await pending;
    } catch (error) {
      if (unique) {
        throw new DataExtensionValidationError(
          `${field.key} is one-to-one but its uniqueness index could not be built; existing links may already repeat a record`,
        );
      }

      console.warn(
        `Data Extensions index ${id} not built: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
};

/**
 * Unique fields get a partial unique index on first write, like one-to-one
 * links. If it cannot be built (existing values already repeat) the write
 * is refused, so uniqueness never rests on the racy pre-check alone.
 */
const ensureUniqueValueIndex = async (
  adapters: IDataExtensionStorageAdapter[],
  field: IDataExtensionField,
) => {
  const fieldId = String((field as { _id?: unknown })._id ?? '');
  const path = relationPath(field.key);

  for (const { model } of adapters) {
    const id = [
      model.db.name,
      model.collection.collectionName,
      field.key,
      fieldId,
      'value-unique',
    ].join(':');
    let pending = ensuredIndexes.get(id);

    if (!pending) {
      pending = model.collection
        .createIndex(
          { [path]: 1 },
          {
            name: `dataExtensions_${field.key}_unique`,
            unique: true,
            partialFilterExpression: { [path]: { $exists: true } },
          },
        )
        .then(() => undefined)
        .catch((error) => {
          ensuredIndexes.delete(id);
          throw error;
        });
      ensuredIndexes.set(id, pending);
    }

    try {
      await pending;
    } catch {
      throw new DataExtensionValidationError(
        `${field.key} is unique but its index could not be built; existing records may already repeat a value`,
      );
    }
  }
};

const assertValueAvailable = async (
  adapters: IDataExtensionStorageAdapter[],
  field: IDataExtensionField,
  value: unknown,
  ownId: string | Types.ObjectId,
) => {
  for (const { model } of adapters) {
    const filter: Record<string, unknown> = {
      [relationPath(field.key)]: value,
      _id: { $ne: ownId },
    };

    if (await model.collection.countDocuments(filter, { limit: 1 })) {
      throw new DataExtensionValidationError(
        `Another record already has this ${field.label || field.key}`,
      );
    }
  }
};

const assertOneToOneAvailable = async (
  adapters: IDataExtensionStorageAdapter[],
  field: IDataExtensionField,
  targetId: string,
  ownId: string | Types.ObjectId,
) => {
  for (const { model } of adapters) {
    const filter: Record<string, unknown> = {
      [relationPath(field.key)]: targetId,
      _id: { $ne: ownId },
    };

    if (await model.collection.countDocuments(filter, { limit: 1 })) {
      throw new DataExtensionValidationError(
        `${field.key} is one-to-one and that record is already linked`,
      );
    }
  }
};

/**
 * Reverse lookup for the virtual side of a relation: the records of this
 * type whose `key` links to each target id, a bounded page per target.
 */
export const findDataExtensionRecordsByRelation = async (
  context: IDataExtensionOwnerContext,
  owner: string,
  recordType: string,
  key: string,
  targetIds: string[],
  limit?: number,
): Promise<{ targetId: string; records: IDataExtensionRecord[] }[]> => {
  const descriptor = resolveDescriptor(recordType, owner);
  const activeFields = await getFieldsForRead(context.metadata, recordType);
  const field = activeFields.find(
    (candidate) =>
      candidate.key === key && candidate.relation?.side === 'source',
  );

  if (!field) {
    throw new DataExtensionValidationError(`Unknown relation "${key}"`);
  }

  if (targetIds.length > DATA_EXTENSION_LIMITS.recordsPerLookup) {
    throw new DataExtensionValidationError(
      `At most ${DATA_EXTENSION_LIMITS.recordsPerLookup} records per lookup`,
    );
  }

  const pageSize = Math.min(
    Math.max(limit || DATA_EXTENSION_LIMITS.relationPageSize, 1),
    DATA_EXTENSION_LIMITS.relationPageMax,
  );
  const adapters = resolveAdapters(descriptor, context);
  const scopeFilter = buildDataExtensionScopeFilter(descriptor.scope);

  await ensureRelationIndexes(adapters, field);

  const ids = Array.from(
    new Set(
      targetIds.filter((id) => typeof id === 'string' && id.length <= 64),
    ),
  );

  return Promise.all(
    ids.map(async (targetId) => {
      const records: IDataExtensionRecord[] = [];

      for (const adapter of adapters) {
        if (records.length >= pageSize) {
          break;
        }

        const filter: Record<string, unknown> = {
          ...adapter.baseFilter,
          [relationPath(key)]: targetId,
          ...scopeFilter,
        };
        const docs = await adapter.model.collection
          .find(filter, {
            projection: buildProjection(descriptor, adapter),
            sort: { _id: 1 },
            limit: pageSize - records.length,
          })
          .toArray();

        for (const doc of docs) {
          records.push(
            toRecord(descriptor, adapter, doc as LeanRecord, activeFields),
          );
        }
      }

      return { targetId, records };
    }),
  );
};

/**
 * Validates a per-key patch against the definitions active at commit time
 * and writes only the touched namespace paths. The native driver is used so
 * the namespace guard on the owner schema does not strip this write.
 */
export const patchDataExtensionRecord = async (
  context: IDataExtensionOwnerContext,
  owner: string,
  recordType: string,
  id: string,
  values: Record<string, unknown>,
): Promise<IDataExtensionRecord | null> => {
  const descriptor = resolveDescriptor(recordType, owner);
  const [castedId] = castIds(descriptor, [id]);

  if (!castedId) {
    return null;
  }

  const activeFields = await getActiveDataExtensionFields(context.metadata, [
    recordType,
  ]);
  const patch = buildDataExtensionPatch(activeFields, values);
  const scopeFilter = buildDataExtensionScopeFilter(descriptor.scope);
  const update: Record<string, Record<string, unknown>> = {};

  if (Object.keys(patch.$set).length) {
    update.$set = patch.$set;
  }

  if (Object.keys(patch.$unset).length) {
    update.$unset = patch.$unset;
  }

  if (!Object.keys(update).length) {
    throw new DataExtensionValidationError('Nothing to update');
  }

  const adapters = resolveAdapters(descriptor, context);

  for (const field of activeFields) {
    const uniqueValue =
      patch.$set[`${DATA_EXTENSIONS_NAMESPACE}.${field.key}`];

    if (field.settings?.unique && uniqueValue !== undefined) {
      await ensureUniqueValueIndex(adapters, field);
      await assertValueAvailable(adapters, field, uniqueValue, castedId);
    }

    if (
      field.relation?.side !== 'source' ||
      !Object.prototype.hasOwnProperty.call(values, field.key)
    ) {
      continue;
    }

    await ensureRelationIndexes(adapters, field);

    const linked = patch.$set[`${DATA_EXTENSIONS_NAMESPACE}.${field.key}`];

    if (field.relation.kind === 'oneToOne' && typeof linked === 'string') {
      await assertOneToOneAvailable(adapters, field, linked, castedId);
    }
  }

  for (const adapter of adapters) {
    const filter: Record<string, unknown> = {
      ...adapter.baseFilter,
      _id: castedId,
      ...scopeFilter,
    };
    let result;

    try {
      result = await adapter.model.collection.updateOne(filter, update);
    } catch (error) {
      // Lost a race to the unique index the pre-check could not see.
      if (isDuplicateKeyError(error)) {
        throw new DataExtensionValidationError(
          'Another record already has one of these values',
        );
      }

      throw error;
    }

    if (result.matchedCount) {
      const [record] = await getDataExtensionRecords(
        context,
        owner,
        recordType,
        [id],
      );

      return record || null;
    }
  }

  return null;
};

const isDuplicateKeyError = (error: unknown) =>
  Boolean(error) &&
  typeof error === 'object' &&
  (error as { code?: number }).code === 11000;

export type DataExtensionLinkAction = 'add' | 'remove';

/**
 * Adds or removes one target id on the relation `key` of several records.
 * This is how the virtual side of a relation is written: linking tasks to a
 * project from the project's side sets the project id on each task. Every
 * record changes in one atomic update; removal only clears links that still
 * point at `targetId`, so a concurrent re-link elsewhere is never undone.
 * Returns the ids that hold the link afterwards (add) or no longer do
 * (remove).
 */
export const linkDataExtensionRecords = async (
  context: IDataExtensionOwnerContext,
  owner: string,
  recordType: string,
  key: string,
  ids: string[],
  targetId: string,
  action: DataExtensionLinkAction,
): Promise<{ ids: string[] }> => {
  const descriptor = resolveDescriptor(recordType, owner);
  const activeFields = await getActiveDataExtensionFields(context.metadata, [
    recordType,
  ]);
  const field = activeFields.find(
    (candidate) =>
      candidate.key === key && candidate.relation?.side === 'source',
  );

  if (!field?.relation) {
    throw new DataExtensionValidationError(`Unknown relation "${key}"`);
  }

  if (ids.length > DATA_EXTENSION_LIMITS.recordsPerLookup) {
    throw new DataExtensionValidationError(
      `At most ${DATA_EXTENSION_LIMITS.recordsPerLookup} records per link`,
    );
  }

  if (!targetId || targetId.length > 64) {
    throw new DataExtensionValidationError(`${key} must link a record id`);
  }

  const castedIds = castIds(descriptor, Array.from(new Set(ids)));

  if (!castedIds.length) {
    return { ids: [] };
  }

  const { kind } = field.relation;

  if (action === 'add' && kind === 'oneToOne' && castedIds.length > 1) {
    throw new DataExtensionValidationError(
      `${key} is one-to-one; link a single record`,
    );
  }

  const adapters = resolveAdapters(descriptor, context);
  const scopeFilter = buildDataExtensionScopeFilter(descriptor.scope);
  const path = relationPath(key);
  // Matches the target whether the value is one id or a list of ids.
  const holdsTarget = { [path]: targetId };

  await ensureRelationIndexes(adapters, field);

  if (action === 'add' && kind === 'oneToOne') {
    await assertOneToOneAvailable(adapters, field, targetId, castedIds[0]);
  }

  let update: Record<string, Record<string, unknown>>;
  let condition: Record<string, unknown> = {};

  if (action === 'remove') {
    condition = holdsTarget;
    update =
      kind === 'manyToMany'
        ? { $pull: { [path]: targetId } }
        : { $unset: { [path]: '' } };
  } else if (kind === 'manyToMany') {
    // A full list is left as is; it is reported as not linked.
    condition = {
      [`${path}.${DATA_EXTENSION_LIMITS.relationIdsPerValue - 1}`]: {
        $exists: false,
      },
    };
    update = { $addToSet: { [path]: targetId } };
  } else {
    update = { $set: { [path]: targetId } };
  }

  const changed: string[] = [];

  for (const adapter of adapters) {
    const filter: Record<string, unknown> = {
      ...adapter.baseFilter,
      ...scopeFilter,
      _id: { $in: castedIds },
    };

    try {
      await adapter.model.collection.updateMany(
        { ...filter, ...condition },
        update,
      );
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        throw new DataExtensionValidationError(
          `${key} is one-to-one and that record is already linked`,
        );
      }

      throw error;
    }

    const docs = await adapter.model.collection
      .find(
        action === 'add'
          ? { ...filter, ...holdsTarget }
          : { ...filter, [path]: { $ne: targetId } },
        { projection: { _id: 1 } },
      )
      .toArray();

    changed.push(...docs.map((doc) => String(doc._id)));
  }

  return { ids: changed };
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Name search used by record pickers, newest first. The record type's scope
 * and the adapter's base filter apply, so a picker only offers records the
 * owner would accept in a link.
 */
export const searchDataExtensionRecords = async (
  context: IDataExtensionOwnerContext,
  owner: string,
  recordType: string,
  searchValue?: string,
  limit?: number,
): Promise<IDataExtensionRecord[]> => {
  const descriptor = resolveDescriptor(recordType, owner);
  const text = (searchValue || '')
    .trim()
    .slice(0, DATA_EXTENSION_LIMITS.searchTextLength);
  const pageSize = Math.min(
    Math.max(limit || DATA_EXTENSION_LIMITS.searchPageSize, 1),
    DATA_EXTENSION_LIMITS.searchPageMax,
  );
  const activeFields = await getFieldsForRead(context.metadata, recordType);
  const scopeFilter = buildDataExtensionScopeFilter(descriptor.scope);
  const pattern = text ? new RegExp(escapeRegExp(text), 'i') : null;
  const records: IDataExtensionRecord[] = [];

  for (const adapter of resolveAdapters(descriptor, context)) {
    if (records.length >= pageSize) {
      break;
    }

    const filter: Record<string, unknown> = {
      ...adapter.baseFilter,
      ...scopeFilter,
    };

    if (pattern) {
      filter.$or = (adapter.searchPaths || ['name']).map((path) => ({
        [path]: pattern,
      }));
    }

    const docs = await adapter.model.collection
      .find(filter, {
        projection: buildProjection(descriptor, adapter),
        sort: { _id: -1 },
        limit: pageSize - records.length,
      })
      .toArray();

    for (const doc of docs) {
      records.push(
        toRecord(descriptor, adapter, doc as LeanRecord, activeFields),
      );
    }
  }

  return records;
};

/**
 * Removes every stored value of deleted fields from a record type's
 * storages, with their relation indexes. Runs over the whole storage, not
 * the record type's scope: a contact that lost the vendor role still holds
 * its vendor values. Refuses keys that are still active, so only values of
 * fields already taken out of use can be removed.
 */
export const purgeDataExtensionValues = async (
  context: IDataExtensionOwnerContext,
  owner: string,
  recordType: string,
  keys: string[],
): Promise<{ records: number }> => {
  const descriptor = resolveDescriptor(recordType, owner);
  const active = await getActiveDataExtensionFields(context.metadata, [
    recordType,
  ]);
  const uniqueKeys = Array.from(new Set(keys));
  const live = uniqueKeys.filter((key) =>
    active.some((field) => field.key === key),
  );

  if (live.length) {
    throw new DataExtensionValidationError(
      `Archive ${live.join(', ')} before removing its values`,
    );
  }

  if (!uniqueKeys.length) {
    return { records: 0 };
  }

  const $unset: Record<string, ''> = {};
  const indexNames = new Set<string>();

  for (const key of uniqueKeys) {
    $unset[relationPath(key)] = '';
    indexNames.add(`dataExtensions_${key}`);
    indexNames.add(`dataExtensions_${key}_unique`);
  }

  let records = 0;

  for (const { model } of resolveAdapters(descriptor, context)) {
    const result = await model.collection.updateMany(
      {
        $or: uniqueKeys.map((key) => ({
          [relationPath(key)]: { $exists: true },
        })),
      },
      { $unset },
    );

    records += result.modifiedCount;

    const indexes = await model.collection.indexes();

    for (const index of indexes) {
      if (index.name && indexNames.has(index.name)) {
        await model.collection.dropIndex(index.name);
      }
    }
  }

  return { records };
};

/**
 * Combines the namespace values of records being merged, later records
 * winning per key as `propertiesData` merges do.
 */
export const mergeDataExtensionValues = (
  docs: { dataExtensions?: unknown }[],
): Record<string, unknown> => {
  const merged: Record<string, unknown> = {};

  for (const doc of docs) {
    const values = doc.dataExtensions;

    if (values && typeof values === 'object' && !Array.isArray(values)) {
      Object.assign(merged, values);
    }
  }

  return merged;
};

/**
 * Carries merged values onto the record a merge creates. Values were
 * validated when first written, so they are copied per key, not replaced.
 */
export const carryDataExtensionValues = async (
  model: Pick<IDataExtensionOwnerModel, 'collection'>,
  targetId: string,
  docs: { _id?: unknown; dataExtensions?: unknown }[],
): Promise<void> => {
  const merged = mergeDataExtensionValues(docs);
  const $set: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(merged)) {
    $set[`${DATA_EXTENSIONS_NAMESPACE}.${key}`] = value;
  }

  if (!Object.keys($set).length) {
    return;
  }

  // Values move rather than copy: the merged-away records stop holding
  // them first, so a one-to-one link is never held twice and a soft-deleted
  // original cannot keep a target reserved.
  const sourceIds = docs
    .map((doc) => doc._id)
    .filter((id) => id !== undefined && String(id) !== targetId);

  if (sourceIds.length) {
    const sources: Record<string, unknown> = { _id: { $in: sourceIds } };

    await model.collection.updateMany(sources, {
      $unset: { [DATA_EXTENSIONS_NAMESPACE]: '' },
    });
  }

  const filter: Record<string, unknown> = { _id: targetId };

  await model.collection.updateOne(filter, { $set });
};

/**
 * Checks unique values before a write that `patchDataExtensionRecord` does
 * not make, such as creating a custom object record. `ownId` is the record
 * that may keep its own value.
 */
export const assertDataExtensionUniqueValues = async (
  context: IDataExtensionOwnerContext,
  owner: string,
  recordType: string,
  values: Record<string, unknown>,
  ownId = '',
): Promise<void> => {
  const descriptor = resolveDescriptor(recordType, owner);
  const activeFields = await getActiveDataExtensionFields(context.metadata, [
    recordType,
  ]);
  const adapters = resolveAdapters(descriptor, context);

  for (const field of activeFields) {
    const value = values[field.key];

    if (!field.settings?.unique || value === undefined || value === null) {
      continue;
    }

    await ensureUniqueValueIndex(adapters, field);
    await assertValueAvailable(adapters, field, value, ownId);
  }
};

export interface IDataExtensionListInput {
  searchValue?: string;
  limit?: number;
  skip?: number;
  /** A native field name or `dataExtensions.<key>` of an active field. */
  sortField?: string;
  sortDirection?: 1 | -1;
  /** A view's conditions; turned into a Mongo filter here, on active fields. */
  filter?: IDataExtensionFilter | null;
}

/**
 * One page of records with the total, for list views. Sorting is limited to
 * native fields and active extension fields, so a client cannot sort on an
 * arbitrary or unindexed path of the owner's documents.
 */
export const listDataExtensionRecords = async (
  context: IDataExtensionOwnerContext,
  owner: string,
  recordType: string,
  input: IDataExtensionListInput = {},
): Promise<{ records: IDataExtensionRecord[]; totalCount: number }> => {
  const descriptor = resolveDescriptor(recordType, owner);
  const [adapter, ...others] = resolveAdapters(descriptor, context);

  if (others.length) {
    throw new DataExtensionValidationError(
      `${descriptor.label} are stored in several places and cannot be listed as one`,
    );
  }

  const activeFields = await getFieldsForRead(context.metadata, recordType);
  const limit = Math.min(
    Math.max(input.limit || DATA_EXTENSION_LIMITS.recordsPageSize, 1),
    DATA_EXTENSION_LIMITS.recordsPageMax,
  );
  const skip = Math.max(Math.floor(input.skip || 0), 0);
  const text = (input.searchValue || '')
    .trim()
    .slice(0, DATA_EXTENSION_LIMITS.searchTextLength);
  const filter: Record<string, unknown> = {
    ...adapter.baseFilter,
    ...buildDataExtensionScopeFilter(descriptor.scope),
    ...buildDataExtensionRecordFilter(descriptor, activeFields, input.filter),
  };

  if (text) {
    const pattern = new RegExp(escapeRegExp(text), 'i');

    filter.$and = [
      ...((filter.$and as unknown[]) || []),
      {
        $or: (adapter.searchPaths || ['name']).map((path) => ({
          [path]: pattern,
        })),
      },
    ];
  }

  const sortable = new Set([
    ...descriptor.nativeFields
      .filter((field) => !field.computed)
      .map((field) => field.path || field.name),
    ...activeFields
      .filter((field) => !field.relation)
      .map((field) => relationPath(field.key)),
  ]);
  const sortField =
    input.sortField && sortable.has(input.sortField) ? input.sortField : '_id';
  const sort: Record<string, 1 | -1> = {
    [sortField]: input.sortDirection === 1 ? 1 : -1,
  };

  if (sortField !== '_id') {
    sort._id = -1;
  }

  const [docs, totalCount] = await Promise.all([
    adapter.model.collection
      .find(filter, {
        projection: buildProjection(descriptor, adapter),
        sort,
        skip,
        limit,
      })
      .toArray(),
    adapter.model.collection.countDocuments(filter),
  ]);

  return {
    records: docs.map((doc) =>
      toRecord(descriptor, adapter, doc as LeanRecord, activeFields),
    ),
    totalCount,
  };
};

export interface IDataExtensionAggregateGroup {
  /** The group's value: an option, a record id, true/false, or null. */
  key: unknown;
  count: number;
  /** One number per requested metric, in order; null where nothing to total. */
  values: (number | null)[];
}

/**
 * Totals for a board column, a table footer or a chart: records counted
 * and summed per group, under the same filter a list would use. Currency
 * totals add amounts, so they assume one currency per field.
 */
export const aggregateDataExtensionRecords = async (
  context: IDataExtensionOwnerContext,
  owner: string,
  recordType: string,
  input: {
    filter?: IDataExtensionFilter | null;
    groupBy?: string;
    metrics?: IDataExtensionMetric[];
  },
): Promise<IDataExtensionAggregateGroup[]> => {
  const descriptor = resolveDescriptor(recordType, owner);
  const [adapter, ...others] = resolveAdapters(descriptor, context);

  if (others.length) {
    throw new DataExtensionValidationError(
      `${descriptor.label} are stored in several places and cannot be totalled as one`,
    );
  }

  const activeFields = await getFieldsForRead(context.metadata, recordType);
  const metrics = input.metrics || [];
  const match = {
    ...adapter.baseFilter,
    ...buildDataExtensionScopeFilter(descriptor.scope),
    ...buildDataExtensionRecordFilter(descriptor, activeFields, input.filter),
  };
  const rows = await adapter.model.collection
    .aggregate([
      { $match: match },
      ...buildDataExtensionAggregateStages(activeFields, input.groupBy, metrics),
    ])
    .toArray();

  return rows.map((row) => ({
    key: row._id ?? null,
    count: row.count,
    values: metrics.map((metric, index) =>
      metric.op === 'count' ? row.count : (row[`m${index}`] ?? null),
    ),
  }));
};
