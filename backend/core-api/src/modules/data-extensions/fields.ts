import {
  bumpDataExtensionSchemaVersion,
  DATA_EXTENSION_FIELD_STATUSES,
  DATA_EXTENSION_LIMITS,
  DATA_EXTENSION_RECORD_TYPES,
  DataExtensionValidationError,
  getCustomDataExtensionRecordTypes,
  getDataExtensionRecordType,
  getDataExtensionStorageKeys,
  getRecordTypesSharingStorage,
  IDataExtensionFieldCreateInput,
  IDataExtensionFieldDocument,
  IDataExtensionField,
  IDataExtensionFieldEditInput,
  IDataExtensionRelationCreateInput,
  ownerProofPayload,
  purgeDataExtensionValues,
  signDataExtensionsProof,
  validateDataExtensionFieldCreate,
  validateDataExtensionFieldEdit,
  validateDataExtensionRelationCreate,
  formulaFieldKeys,
  parseFormula,
} from 'erxes-api-shared/core-modules';
import { isEnabled, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildOwnerContext } from '@/data-extensions/trpc/dataExtensions';

const { ACTIVE, ARCHIVED, PENDING } = DATA_EXTENSION_FIELD_STATUSES;

// A pending relation side older than this was left by a failed create.
const STALE_PENDING_MS = 5 * 60 * 1000;

const isDuplicateKeyError = (error: unknown) =>
  Boolean(error) &&
  typeof error === 'object' &&
  (error as { code?: number }).code === 11000;

const PUBLISH_ATTEMPTS = 3;

/**
 * Bumps the version after a definition change. Retried so a transient
 * failure does not leave runtimes serving the previous schema; owners still
 * validate every write against current definitions either way.
 */
const publishVersion = async (models: IModels) => {
  let lastError: unknown;

  for (let attempt = 0; attempt < PUBLISH_ATTEMPTS; attempt++) {
    try {
      return await bumpDataExtensionSchemaVersion(models);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const listDataExtensionRecordTypes = async (models: IModels) => {
  const counts = await models.DataExtensionFields.aggregate<{
    _id: string;
    count: number;
  }>([
    { $match: { status: ACTIVE } },
    { $group: { _id: '$recordType', count: { $sum: 1 } } },
  ]);
  const countByType = new Map(counts.map(({ _id, count }) => [_id, count]));
  // Record types of plugins that are not running are not offered.
  const owners = Array.from(
    new Set(DATA_EXTENSION_RECORD_TYPES.map(({ owner }) => owner)),
  );
  const enabled = new Set<string>();

  for (const owner of owners) {
    if (await isEnabled(owner)) {
      enabled.add(owner);
    }
  }

  return [
    ...DATA_EXTENSION_RECORD_TYPES.filter((descriptor) =>
      enabled.has(descriptor.owner),
    ),
    ...getCustomDataExtensionRecordTypes(),
  ].map(
    ({
      recordType,
      label,
      typeName,
      owner,
      contentTypes,
      createMutations,
      custom,
      icon,
      singularLabel,
      description,
    }) => ({
      recordType,
      label,
      typeName,
      owner,
      contentTypes,
      createMutations: createMutations || [],
      custom: Boolean(custom),
      icon: icon || null,
      singularLabel: singularLabel || null,
      description: description || null,
      fieldCount: countByType.get(recordType) || 0,
    }),
  );
};

export const listDataExtensionFields = async (
  models: IModels,
  {
    recordType,
    includeArchived,
  }: { recordType?: string; includeArchived?: boolean },
) => {
  const filter: Record<string, unknown> = {};

  if (recordType) {
    filter.recordType = recordType;
  }

  filter.status = includeArchived ? { $in: [ACTIVE, ARCHIVED] } : ACTIVE;

  return models.DataExtensionFields.find(filter)
    .sort({ recordType: 1, order: 1, createdAt: 1 })
    .lean<IDataExtensionFieldDocument[]>();
};

const getField = async (models: IModels, _id: string) => {
  const field = await models.DataExtensionFields.findById(
    _id,
  ).lean<IDataExtensionFieldDocument | null>();

  if (!field) {
    throw new DataExtensionValidationError('Field not found');
  }

  return field;
};

const assertBelowFieldLimit = async (models: IModels, recordType: string) => {
  const activeCount = await models.DataExtensionFields.countDocuments({
    recordType,
    status: ACTIVE,
  });

  if (activeCount >= DATA_EXTENSION_LIMITS.fieldsPerRecordType) {
    throw new DataExtensionValidationError(
      `A record type can have at most ${DATA_EXTENSION_LIMITS.fieldsPerRecordType} active fields`,
    );
  }
};

/**
 * Record types that share a document share its namespace, so a key is taken
 * once across them. Archived fields keep their key because stored values
 * still sit under it.
 */
const assertKeyAvailable = async (
  models: IModels,
  recordType: string,
  key: string,
) => {
  const taken = await models.DataExtensionFields.findOne({
    recordType: { $in: getRecordTypesSharingStorage(recordType) },
    key,
  })
    .select('recordType status')
    .lean<Pick<IDataExtensionFieldDocument, 'recordType' | 'status'> | null>();

  if (taken) {
    const owner = getDataExtensionRecordType(taken.recordType)?.label;

    throw new DataExtensionValidationError(
      `Key "${key}" is already used by ${owner || taken.recordType}${
        taken.status === ARCHIVED ? ' (archived)' : ''
      }`,
    );
  }
};

const NUMERIC_TYPES = ['number', 'currency', 'percent', 'rating'];
const COMPUTED = ['formula', 'rollup'];

/**
 * Formulas may only read stored fields of the same record type, so they
 * can never form a cycle. Rollups total a numeric field over a relation
 * that lists records.
 */
const assertComputedReferences = async (
  models: IModels,
  field: Pick<IDataExtensionField, 'recordType' | 'type' | 'settings' | 'key'>,
) => {
  if (!COMPUTED.includes(field.type)) {
    return;
  }

  const siblings = await models.DataExtensionFields.find({
    recordType: field.recordType,
    status: ACTIVE,
  }).lean<IDataExtensionFieldDocument[]>();
  const byKey = new Map(siblings.map((sibling) => [sibling.key, sibling]));

  if (field.type === 'formula') {
    for (const key of formulaFieldKeys(parseFormula(field.settings?.expression || ''))) {
      const used = byKey.get(key);

      if (!used || key === field.key) {
        throw new DataExtensionValidationError(`Formula: no field {${key}} on this record type`);
      }

      if (COMPUTED.includes(used.type) || used.relation) {
        throw new DataExtensionValidationError(
          `Formula: {${key}} is computed or a relation; use stored values`,
        );
      }
    }

    return;
  }

  const rollup = field.settings?.rollup;
  const relation = rollup ? byKey.get(rollup.relation) : undefined;
  const lists =
    relation?.relation &&
    (relation.relation.kind === 'manyToMany' ||
      (relation.relation.side === 'inverse' && relation.relation.kind === 'manyToOne'));

  if (!rollup || !relation?.relation || !lists) {
    throw new DataExtensionValidationError(
      'Rollup: pick a relation on this record type that lists records (has many)',
    );
  }

  if (rollup.op !== 'count') {
    const target = await models.DataExtensionFields.findOne({
      recordType: relation.relation.targetRecordType,
      key: rollup.field,
      status: ACTIVE,
    }).lean<IDataExtensionFieldDocument | null>();

    if (!target || !NUMERIC_TYPES.includes(target.type)) {
      throw new DataExtensionValidationError(
        'Rollup: total a number, currency, percent or rating field of the linked records',
      );
    }
  }
};

export const addDataExtensionField = async (
  models: IModels,
  input: IDataExtensionFieldCreateInput,
  userId: string,
) => {
  const field = validateDataExtensionFieldCreate(input);

  await assertComputedReferences(models, field);
  await assertBelowFieldLimit(models, field.recordType);
  await assertKeyAvailable(models, field.recordType, field.key);

  let created;

  try {
    created = await models.DataExtensionFields.create({
      ...field,
      storageKeys: getDataExtensionStorageKeys(field.recordType, field.key),
      status: ACTIVE,
      createdBy: userId,
      updatedBy: userId,
    });
  } catch (error) {
    // A concurrent create for a record type sharing this storage won.
    if (isDuplicateKeyError(error)) {
      throw new DataExtensionValidationError(
        `Key "${field.key}" is already used by another record type on the same records`,
      );
    }

    throw error;
  }

  await publishVersion(models);

  return created.toObject();
};

export const editDataExtensionField = async (
  models: IModels,
  _id: string,
  input: IDataExtensionFieldEditInput,
  userId: string,
) => {
  const existing = await getField(models, _id);
  const update = validateDataExtensionFieldEdit(existing, input);

  if (update.settings) {
    await assertComputedReferences(models, { ...existing, settings: update.settings });
  }

  const updated = await models.DataExtensionFields.findOneAndUpdate(
    { _id },
    { $set: { ...update, updatedBy: userId } },
    { new: true },
  ).lean<IDataExtensionFieldDocument | null>();

  await publishVersion(models);

  return updated;
};

const setFieldStatus = async (
  models: IModels,
  _id: string,
  status: typeof ACTIVE | typeof ARCHIVED,
  userId: string,
) => {
  const existing = await getField(models, _id);

  if (existing.status === PENDING) {
    throw new DataExtensionValidationError(
      'This relation is still being created; try again in a moment',
    );
  }

  if (existing.status === status) {
    return existing;
  }

  // Both sides of a relation are archived and restored together.
  const pair = [existing._id];

  if (existing.relation?.inverseFieldId) {
    pair.push(existing.relation.inverseFieldId);
  }

  if (status === ACTIVE) {
    const fields = await models.DataExtensionFields.find({ _id: { $in: pair } })
      .select('recordType')
      .lean<Pick<IDataExtensionFieldDocument, 'recordType'>[]>();

    for (const field of fields) {
      await assertBelowFieldLimit(models, field.recordType);
    }
  }

  await models.DataExtensionFields.updateMany(
    { _id: { $in: pair } },
    { $set: { status, updatedBy: userId } },
  );

  const updated = await models.DataExtensionFields.findById(
    _id,
  ).lean<IDataExtensionFieldDocument | null>();

  await publishVersion(models);

  return updated;
};

/** Hides a field from schemas and writes. Stored values stay on records. */
export const archiveDataExtensionField = (
  models: IModels,
  _id: string,
  userId: string,
) => setFieldStatus(models, _id, ARCHIVED, userId);

export const restoreDataExtensionField = (
  models: IModels,
  _id: string,
  userId: string,
) => setFieldStatus(models, _id, ACTIVE, userId);

const assertBelowRelationLimit = async (
  models: IModels,
  recordType: string,
) => {
  const relationCount = await models.DataExtensionFields.countDocuments({
    recordType,
    status: ACTIVE,
    type: 'relation',
  });

  if (relationCount >= DATA_EXTENSION_LIMITS.relationsPerRecordType) {
    throw new DataExtensionValidationError(
      `A record type can have at most ${DATA_EXTENSION_LIMITS.relationsPerRecordType} active relations`,
    );
  }
};

const createReserved = async (
  models: IModels,
  field: Omit<IDataExtensionField, 'status'>,
) => {
  try {
    return await models.DataExtensionFields.create({
      ...field,
      storageKeys: getDataExtensionStorageKeys(field.recordType, field.key),
      status: PENDING,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new DataExtensionValidationError(
        `Key "${field.key}" is already used on ${
          getDataExtensionRecordType(field.recordType)?.label ||
          field.recordType
        }`,
      );
    }

    throw error;
  }
};

/** Frees keys held by relation halves a crashed create left behind. */
const removeStalePendingFields = (models: IModels) =>
  models.DataExtensionFields.deleteMany({
    status: PENDING,
    createdAt: { $lt: new Date(Date.now() - STALE_PENDING_MS) },
  });

/**
 * Creates both sides of a relation. Each side is inserted as `pending`
 * (readers only see active fields), linked to its pair, and then both are
 * activated in a single update. Any failure removes whatever was inserted,
 * so a half relation is never published.
 */
export const addDataExtensionRelation = async (
  models: IModels,
  input: IDataExtensionRelationCreateInput,
  userId: string,
) => {
  const { source, inverse } = validateDataExtensionRelationCreate(input);

  await removeStalePendingFields(models);

  for (const field of [source, inverse]) {
    await assertBelowFieldLimit(models, field.recordType);
    await assertBelowRelationLimit(models, field.recordType);
    await assertKeyAvailable(models, field.recordType, field.key);
  }

  const created: string[] = [];

  try {
    const createdSource = await createReserved(models, {
      ...source,
      createdBy: userId,
      updatedBy: userId,
    });

    created.push(createdSource._id);

    const createdInverse = await createReserved(models, {
      ...inverse,
      relation: inverse.relation && {
        ...inverse.relation,
        inverseFieldId: createdSource._id,
      },
      createdBy: userId,
      updatedBy: userId,
    });

    created.push(createdInverse._id);

    await models.DataExtensionFields.updateOne(
      { _id: createdSource._id },
      { $set: { 'relation.inverseFieldId': createdInverse._id } },
    );

    const activated = await models.DataExtensionFields.updateMany(
      { _id: { $in: created }, status: PENDING },
      { $set: { status: ACTIVE } },
    );

    if (activated.modifiedCount !== created.length) {
      throw new Error('Relation sides changed while being created');
    }
  } catch (error) {
    await models.DataExtensionFields.deleteMany({
      _id: { $in: created },
      status: PENDING,
    });
    throw error;
  }

  await publishVersion(models);

  return models.DataExtensionFields.find({ _id: { $in: created } })
    .sort({ 'relation.side': -1 })
    .lean<IDataExtensionFieldDocument[]>();
};

/**
 * Clears stored values of `keys` at the module that owns the record type.
 * Core records are cleared in-process; other owners get the same signed
 * call the runtime uses.
 */
const purgeOwnerValues = async (
  models: IModels,
  subdomain: string,
  userId: string,
  recordType: string,
  keys: string[],
) => {
  const descriptor = getDataExtensionRecordType(recordType);

  if (!descriptor) {
    return;
  }

  if (descriptor.owner === 'core') {
    await purgeDataExtensionValues(
      buildOwnerContext(models),
      'core',
      recordType,
      keys,
    );
    return;
  }

  if (!(await isEnabled(descriptor.owner))) {
    throw new DataExtensionValidationError(
      `${descriptor.label} values can't be removed while ${descriptor.owner} is not running`,
    );
  }

  const input = { recordType, keys };

  await sendTRPCMessage({
    subdomain,
    pluginName: descriptor.owner,
    method: 'mutation',
    module: 'dataExtensions.records',
    action: 'purge',
    input: {
      ...input,
      proof: signDataExtensionsProof(
        'owner',
        ownerProofPayload(subdomain, userId, input),
      ),
    },
    context: { userId },
    throwOnError: true,
  });
};

/**
 * Deletes a field for good: both sides of a relation, every stored value
 * and its relation index, so the key can be reused for a new field. The
 * field is archived first, which stops all writes to it; values are then
 * removed at each owner, and only after that are the definitions deleted.
 * If an owner cannot be reached the field stays archived and nothing is
 * lost that a retry cannot finish.
 */
export const deleteDataExtensionField = async (
  models: IModels,
  subdomain: string,
  _id: string,
  userId: string,
) => {
  const existing = await getField(models, _id);

  if (existing.status === PENDING) {
    throw new DataExtensionValidationError(
      'This relation is still being created; try again in a moment',
    );
  }

  const fields = [existing];

  if (existing.relation?.inverseFieldId) {
    const pair = await models.DataExtensionFields.findById(
      existing.relation.inverseFieldId,
    ).lean<IDataExtensionFieldDocument | null>();

    if (pair) {
      fields.push(pair);
    }
  }

  const ids = fields.map((field) => field._id);

  await models.DataExtensionFields.updateMany(
    { _id: { $in: ids }, status: ACTIVE },
    { $set: { status: ARCHIVED, updatedBy: userId } },
  );
  await publishVersion(models);

  // The virtual side of a relation stores nothing.
  for (const field of fields) {
    if (field.relation?.side !== 'inverse') {
      await purgeOwnerValues(models, subdomain, userId, field.recordType, [
        field.key,
      ]);
    }
  }

  await models.DataExtensionFields.deleteMany({ _id: { $in: ids } });
  await publishVersion(models);

  return ids;
};
