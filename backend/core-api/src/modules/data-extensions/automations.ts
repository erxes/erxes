import {
  DATA_EXTENSIONS_NAMESPACE,
  getActiveDataExtensionFields,
  getDataExtensionRecordType,
  IDataExtensionField,
  patchDataExtensionRecord,
} from 'erxes-api-shared/core-modules';
import { IModels } from '~/connectionResolvers';
import { buildOwnerContext } from '@/data-extensions/trpc/dataExtensions';
import {
  deliverDataExtensionWebhooks,
  recordDataExtensionChanges,
} from '@/data-extensions/changes';
import { announceDataExtensionChange } from '@/data-extensions/events';

/** Who history names for values an automation set. */
export const DATA_EXTENSION_AUTOMATION_USER = 'automation';

const PREFIX = `${DATA_EXTENSIONS_NAMESPACE}.`;

/** Core set-property modules whose records carry Data Extensions. */
const RECORD_TYPE_OF_COLLECTION: Record<string, string> = {
  customers: 'core:customer',
  leads: 'core:lead',
  companies: 'core:company',
  users: 'core:teamMember',
};

export const dataExtensionRecordTypeOfModule = (module: string) => {
  const [, moduleName, collectionName] = module.replace(/\./g, ':').split(':');

  return RECORD_TYPE_OF_COLLECTION[collectionName || moduleName];
};

/** Fields an automation may set: stored, not relations. */
export const isAutomationWritable = (field: IDataExtensionField) =>
  !field.relation && !['formula', 'rollup'].includes(field.type);

type TModifier = Record<string, Record<string, unknown> | undefined>;

type TExtensionOperation = { operator: string; key: string; value: unknown };

/** Separates `dataExtensions.<key>` paths from the owner's own paths. */
export const splitDataExtensionModifier = (modifier: TModifier) => {
  const native: TModifier = {};
  const extension: TExtensionOperation[] = [];

  for (const [operator, paths] of Object.entries(modifier)) {
    for (const [path, value] of Object.entries(paths || {})) {
      if (path.startsWith(PREFIX)) {
        extension.push({ operator, key: path.slice(PREFIX.length), value });
      } else {
        native[operator] = { ...(native[operator] || {}), [path]: value };
      }
    }
  }

  return { native, extension };
};

const LIST_TYPES = ['multiSelect', 'emails', 'phones', 'links', 'files'];

const isList = (field: IDataExtensionField) =>
  LIST_TYPES.includes(field.type) ||
  (field.type === 'member' && Boolean(field.settings?.multiple));

const toList = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return value === undefined || value === null ? [] : [value];
};

const toNumber = (value: unknown) =>
  typeof value === 'string' &&
  value.trim() !== '' &&
  !Number.isNaN(Number(value))
    ? Number(value)
    : value;

/**
 * Automation values arrive as text from placeholders and the builder's
 * inputs; this turns them into what the field stores. Anything still wrong
 * is refused by the field's own validation.
 */
export const coerceAutomationValue = (
  field: IDataExtensionField,
  value: unknown,
): unknown => {
  if (value === null || value === undefined) {
    return null;
  }

  if (isList(field)) {
    return toList(value);
  }

  switch (field.type) {
    case 'number':
    case 'rating':
    case 'percent':
      return toNumber(value);
    case 'currency': {
      const amount = toNumber(value);

      return typeof amount === 'number'
        ? { amount, currency: field.settings?.currency }
        : value;
    }
    case 'boolean':
      return value === 'true' ? true : value === 'false' ? false : value;
    default:
      return value;
  }
};

const unwrap = (value: unknown, key: '$each' | '$in') =>
  value && typeof value === 'object' && key in (value as object)
    ? (value as Record<string, unknown>)[key]
    : value;

/** The value one operation leaves on a record that currently holds `current`. */
export const applyAutomationOperation = (
  field: IDataExtensionField,
  { operator, value }: TExtensionOperation,
  current: unknown,
): unknown => {
  switch (operator) {
    case '$set':
      return coerceAutomationValue(field, value);
    case '$unset':
      return null;
    case '$push':
    case '$addToSet': {
      if (!isList(field)) {
        throw new Error(`${field.label} is not a list`);
      }

      const added = toList(unwrap(value, '$each'));
      const existing = toList(current);

      return operator === '$push'
        ? [...existing, ...added]
        : [
            ...existing,
            ...added.filter(
              (item) =>
                !existing.some(
                  (present) => JSON.stringify(present) === JSON.stringify(item),
                ),
            ),
          ];
    }
    case '$pull': {
      if (!isList(field)) {
        throw new Error(`${field.label} is not a list`);
      }

      const removed = toList(unwrap(value, '$in')).map((item) =>
        JSON.stringify(item),
      );

      return toList(current).filter(
        (item) => !removed.includes(JSON.stringify(item)),
      );
    }
    default:
      throw new Error(`${operator} cannot change ${field.label}`);
  }
};

type TSetPropertyModel = {
  find: (selector: Record<string, unknown>) => {
    lean: () => Promise<Record<string, unknown>[]>;
  };
  updateMany: (
    selector: Record<string, unknown>,
    modifier: unknown,
  ) => Promise<unknown>;
};

const assertMembersExist = async (
  models: IModels,
  field: IDataExtensionField,
  value: unknown,
) => {
  if (field.type !== 'member' || value === null) {
    return;
  }

  const ids = toList(value).map(String);
  const found = await models.Users.countDocuments({ _id: { $in: ids } });

  if (found !== new Set(ids).size) {
    throw new Error(`${field.label}: no team member for every id`);
  }
};

/**
 * Runs a set-property write where some paths are Data Extension values.
 * Owner paths go to the model as before; extension values are validated by
 * their definitions per record, and leave history, webhooks and a segment
 * refresh like any other change, but start no automation.
 */
export const updateWithDataExtensions = async ({
  models,
  subdomain,
  module,
  model,
  selector,
  modifier,
}: {
  models: IModels;
  subdomain: string;
  module: string;
  model: TSetPropertyModel;
  selector: Record<string, unknown>;
  modifier: TModifier;
}) => {
  const { native, extension } = splitDataExtensionModifier(modifier);

  if (!extension.length) {
    return model.updateMany(selector, modifier);
  }

  const recordType = dataExtensionRecordTypeOfModule(module);
  const descriptor = recordType && getDataExtensionRecordType(recordType);

  if (!recordType || !descriptor) {
    throw new Error(`${module} has no Data Extensions`);
  }

  const fields = new Map(
    (await getActiveDataExtensionFields(models, [recordType])).map((field) => [
      field.key,
      field,
    ]),
  );

  for (const { key } of extension) {
    const field = fields.get(key);

    if (!field || !isAutomationWritable(field)) {
      throw new Error(
        `"${key}" is not a Data Extension value an automation can set`,
      );
    }
  }

  if (Object.keys(native).length) {
    await model.updateMany(selector, native);
  }

  const records = await model.find(selector).lean();
  const context = buildOwnerContext(models);
  let updated = 0;

  for (const record of records) {
    const id = String(record._id);
    const before = (record[DATA_EXTENSIONS_NAMESPACE] || {}) as Record<
      string,
      unknown
    >;
    const values: Record<string, unknown> = {};

    for (const operation of extension) {
      const field = fields.get(operation.key) as IDataExtensionField;
      const current =
        operation.key in values ? values[operation.key] : before[operation.key];

      values[operation.key] = applyAutomationOperation(
        field,
        operation,
        current,
      );
      await assertMembersExist(models, field, values[operation.key]);
    }

    const saved = await patchDataExtensionRecord(
      context,
      descriptor.owner,
      recordType,
      id,
      values,
    );

    if (!saved) {
      continue;
    }

    updated += 1;

    const changes = Object.keys(values)
      .map((key) => ({
        key,
        before: before[key] ?? null,
        after: saved.dataExtensions[key] ?? null,
      }))
      .filter(
        (change) =>
          JSON.stringify(change.before) !== JSON.stringify(change.after),
      );

    if (!changes.length) {
      continue;
    }

    await recordDataExtensionChanges(
      models,
      recordType,
      id,
      changes,
      'updated',
      DATA_EXTENSION_AUTOMATION_USER,
    );
    deliverDataExtensionWebhooks(models, {
      event: 'updated',
      subdomain,
      recordType,
      recordId: id,
      userId: DATA_EXTENSION_AUTOMATION_USER,
      changes,
    });
    await announceDataExtensionChange(models, {
      subdomain,
      descriptor,
      recordId: id,
      fromAutomation: true,
      loadRecord: async () => record,
    });
  }

  return { matchedCount: updated, modifiedCount: updated };
};

const AUTOMATION_FIELD_TYPES: Record<string, string> = {
  text: 'String',
  longText: 'String',
  email: 'String',
  url: 'String',
  phone: 'String',
  select: 'String',
  member: 'String',
  emails: 'String',
  phones: 'String',
  multiSelect: 'multiSelect',
  number: 'Number',
  rating: 'Number',
  percent: 'Number',
  currency: 'Number',
  boolean: 'Boolean',
  date: 'Date',
  dateTime: 'Date',
};

const AUTOMATION_GROUP = 'Data Extensions';

/** Data Extension fields offered to the set-property action of a module. */
export const listDataExtensionAutomationFields = async (
  models: IModels,
  contentType: string,
) => {
  const recordType = dataExtensionRecordTypeOfModule(contentType);

  if (!recordType) {
    return [];
  }

  const fields = await getActiveDataExtensionFields(models, [recordType]);

  return [...fields]
    .sort((a, b) => a.order - b.order)
    .filter(
      (field) =>
        isAutomationWritable(field) && AUTOMATION_FIELD_TYPES[field.type],
    )
    .map((field) => ({
      _id: `${PREFIX}${field.key}`,
      name: `${PREFIX}${field.key}`,
      label: field.label,
      type: AUTOMATION_FIELD_TYPES[field.type],
      multiple: isList(field) || undefined,
      selectOptions: field.options?.length
        ? field.options.map(({ value, label }) => ({ value, label }))
        : undefined,
      group: AUTOMATION_GROUP,
      groupDetail: { name: AUTOMATION_GROUP },
    }));
};
