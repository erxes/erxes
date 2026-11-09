import {
  assertDataExtensionUniqueValues,
  bumpDataExtensionSchemaVersion,
  buildCustomDataExtensionRecordType,
  buildDataExtensionCreateValues,
  DATA_EXTENSION_FIELD_STATUSES,
  DATA_EXTENSION_LIMITS,
  DATA_EXTENSION_RECORD_TYPES,
  DataExtensionValidationError,
  findGeneratedNameClash,
  getActiveDataExtensionFields,
  getCustomRecordType,
  getDataExtensionObjectModel,
  getDataExtensionRecordModel,
  IDataExtensionObjectCreateInput,
  IDataExtensionObjectDocument,
  IDataExtensionObjectEditInput,
  IDataExtensionRecordType,
  normalizeDataExtensionRecordName,
  runWithDataExtensionRecordTypes,
  validateDataExtensionObjectCreate,
  validateDataExtensionObjectEdit,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';

const { ACTIVE, ARCHIVED } = DATA_EXTENSION_FIELD_STATUSES;

const objectsOf = (models: IModels) =>
  getDataExtensionObjectModel(models.DataExtensionFields.db);

const CUSTOM_TTL_MS = 1000;
const CUSTOM_CACHE_MAX = 5000;
const customByTenant = new Map<
  string,
  { recordTypes: IDataExtensionRecordType[]; readAt: number }
>();

/** Active custom objects as record types, read now. */
export const loadCustomRecordTypes = async (
  models: IModels,
): Promise<IDataExtensionRecordType[]> =>
  (
    await objectsOf(models)
      .find({ status: ACTIVE })
      .sort({ createdAt: 1 })
      .lean<IDataExtensionObjectDocument[]>()
  ).map(buildCustomDataExtensionRecordType);

/**
 * Active custom objects as record types, reused for a second per tenant
 * database like the schema version. Every change bumps the version and
 * clears this tenant's entry, so the writing process sees it at once.
 */
export const getCustomRecordTypes = async (
  models: IModels,
): Promise<IDataExtensionRecordType[]> => {
  const key = models.DataExtensionFields.db.name;
  const cached = customByTenant.get(key);

  if (cached && Date.now() - cached.readAt < CUSTOM_TTL_MS) {
    return cached.recordTypes;
  }

  const recordTypes = await loadCustomRecordTypes(models);

  if (customByTenant.size >= CUSTOM_CACHE_MAX) {
    customByTenant.clear();
  }

  customByTenant.set(key, { recordTypes, readAt: Date.now() });

  return recordTypes;
};

/** Runs `run` with this tenant's custom objects visible to registry lookups. */
export const withCustomRecordTypes = async <T>(
  models: IModels,
  run: () => Promise<T>,
): Promise<T> =>
  runWithDataExtensionRecordTypes(await getCustomRecordTypes(models), run);

const publish = async (models: IModels) => {
  customByTenant.delete(models.DataExtensionFields.db.name);
  await bumpDataExtensionSchemaVersion(models);
};

const getObject = async (models: IModels, _id: string) => {
  const object = await objectsOf(models)
    .findById(_id)
    .lean<IDataExtensionObjectDocument | null>();

  if (!object) {
    throw new DataExtensionValidationError('Object not found');
  }

  return object;
};

export const listDataExtensionObjects = (
  models: IModels,
  includeArchived = false,
) =>
  objectsOf(models)
    .find(includeArchived ? {} : { status: ACTIVE })
    .sort({ createdAt: 1 })
    .lean<IDataExtensionObjectDocument[]>();

export const addDataExtensionObject = async (
  models: IModels,
  input: IDataExtensionObjectCreateInput,
  userId: string,
) => {
  const object = validateDataExtensionObjectCreate(input);
  const Objects = objectsOf(models);

  if ((await Objects.countDocuments()) >= DATA_EXTENSION_LIMITS.objectsPerTenant) {
    throw new DataExtensionValidationError(
      `A workspace can have at most ${DATA_EXTENSION_LIMITS.objectsPerTenant} objects`,
    );
  }

  // Archived objects still reserve their names: their records remain.
  const existing = await Objects.find()
    .lean<IDataExtensionObjectDocument[]>();
  const candidate = buildCustomDataExtensionRecordType(object);
  const clash = findGeneratedNameClash(candidate, [
    ...DATA_EXTENSION_RECORD_TYPES,
    ...existing.map(buildCustomDataExtensionRecordType),
  ]);

  if (clash) {
    throw new DataExtensionValidationError(
      `The key "${object.key}" would reuse the API name ${clash}; choose another key`,
    );
  }

  let created;

  try {
    created = await Objects.create({
      ...object,
      status: ACTIVE,
      createdBy: userId,
      updatedBy: userId,
    });
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) {
      throw new DataExtensionValidationError(
        `An object with the key "${object.key}" already exists`,
      );
    }

    throw error;
  }

  await getDataExtensionRecordModel(
    models.DataExtensionFields.db,
    object.key,
  ).createIndexes();
  await publish(models);

  return created.toObject();
};

export const editDataExtensionObject = async (
  models: IModels,
  _id: string,
  input: IDataExtensionObjectEditInput,
  userId: string,
) => {
  const existing = await getObject(models, _id);
  const update = validateDataExtensionObjectEdit(existing, input);
  const updated = await objectsOf(models)
    .findOneAndUpdate(
      { _id },
      { $set: { ...update, updatedBy: userId } },
      { new: true },
    )
    .lean<IDataExtensionObjectDocument | null>();

  await publish(models);

  return updated;
};

/** Hides an object and its fields from schemas; records stay stored. */
export const setDataExtensionObjectStatus = async (
  models: IModels,
  _id: string,
  status: typeof ACTIVE | typeof ARCHIVED,
  userId: string,
) => {
  const existing = await getObject(models, _id);

  if (existing.status !== status) {
    await objectsOf(models).updateOne(
      { _id },
      { $set: { status, updatedBy: userId } },
    );
    await publish(models);
  }

  return objectsOf(models)
    .findById(_id)
    .lean<IDataExtensionObjectDocument | null>();
};

/**
 * Deletes an archived object for good: its fields, relations other record
 * types have to it, and every record. `deleteField` removes one field the
 * same way the field API does, including stored values at their owner.
 */
export const deleteDataExtensionObject = async (
  models: IModels,
  _id: string,
  deleteField: (fieldId: string) => Promise<unknown>,
) => {
  const existing = await getObject(models, _id);

  if (existing.status !== ARCHIVED) {
    throw new DataExtensionValidationError(
      'Archive the object before deleting it',
    );
  }

  const recordType = getCustomRecordType(existing.key);
  const fields = await models.DataExtensionFields.find({
    $or: [
      { recordType },
      { 'relation.targetRecordType': recordType },
    ],
  })
    .select('_id relation')
    .lean<{ _id: string; relation?: { inverseFieldId?: string } }[]>();
  const done = new Set<string>();

  for (const field of fields) {
    if (done.has(field._id)) {
      continue;
    }

    done.add(field._id);

    if (field.relation?.inverseFieldId) {
      done.add(field.relation.inverseFieldId);
    }

    await deleteField(field._id);
  }

  await getDataExtensionRecordModel(models.DataExtensionFields.db, existing.key)
    .collection.drop()
    .catch((error: { codeName?: string }) => {
      // Never written to: nothing to drop.
      if (error?.codeName !== 'NamespaceNotFound') {
        throw error;
      }
    });
  await objectsOf(models).deleteOne({ _id });
  await publish(models);

  return _id;
};

const customObjectKey = (descriptor: IDataExtensionRecordType) => {
  if (!descriptor.custom) {
    throw new DataExtensionValidationError(
      `${descriptor.label} records are created in their own module`,
    );
  }

  return descriptor.recordType.slice(descriptor.recordType.indexOf(':') + 1);
};

const recordsOf = (models: IModels, descriptor: IDataExtensionRecordType) =>
  getDataExtensionRecordModel(
    models.DataExtensionFields.db,
    customObjectKey(descriptor),
  );

/**
 * Writes check the object's current state, not the cached record types: a
 * schema built a moment before an archive must not keep writing to it.
 */
const writableRecordsOf = async (
  models: IModels,
  descriptor: IDataExtensionRecordType,
) => {
  const key = customObjectKey(descriptor);

  if (!(await objectsOf(models).exists({ key, status: ACTIVE }))) {
    throw new DataExtensionValidationError(
      `${descriptor.label} is archived; restore it to change its records`,
    );
  }

  return recordsOf(models, descriptor);
};

/**
 * Creates a custom object record with its values in one insert: defaults
 * applied, every value checked, required fields present, unique values
 * free. A failed check creates nothing.
 */
export const createCustomRecord = async (
  models: IModels,
  descriptor: IDataExtensionRecordType,
  input: { name: unknown; values?: Record<string, unknown> | null },
  userId: string,
  ownerContext: Parameters<typeof assertDataExtensionUniqueValues>[0],
) => {
  const name = normalizeDataExtensionRecordName(input.name);
  const activeFields = await getActiveDataExtensionFields(models, [
    descriptor.recordType,
  ]);
  const values = buildDataExtensionCreateValues(
    activeFields,
    input.values || {},
  );

  await assertDataExtensionUniqueValues(
    ownerContext,
    'core',
    descriptor.recordType,
    values,
  );

  try {
    const created = await (await writableRecordsOf(models, descriptor)).create({
      name,
      dataExtensions: values,
      createdBy: userId,
      updatedBy: userId,
    });

    return String(created._id);
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) {
      throw new DataExtensionValidationError(
        'Another record already has one of these values',
      );
    }

    throw error;
  }
};

export const renameCustomRecord = async (
  models: IModels,
  descriptor: IDataExtensionRecordType,
  _id: string,
  name: unknown,
  userId: string,
) => {
  const result = await (await writableRecordsOf(models, descriptor)).updateOne(
    { _id },
    { $set: { name: normalizeDataExtensionRecordName(name), updatedBy: userId } },
  );

  return result.matchedCount > 0;
};

/**
 * Deletes a record. Links other records hold to it stop resolving, the way
 * a deleted target of any relation does.
 */
export const deleteCustomRecord = async (
  models: IModels,
  descriptor: IDataExtensionRecordType,
  _id: string,
) => {
  const result = await (await writableRecordsOf(models, descriptor)).deleteOne({
    _id,
  });

  return result.deletedCount > 0;
};
