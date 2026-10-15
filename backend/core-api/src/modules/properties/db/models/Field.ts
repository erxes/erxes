import {
  featuredFieldCode,
  IFeaturedFieldDefinition,
  IFeaturedFieldGroup,
  IFeaturedFieldOwner,
  propertyGroupIdFromKey,
  isPropertyGroupKey,
  reconcilePropertyOptions,
  segmentFiltersByOption,
  IPropertyValueCounts,
  IPropertyValueSamples,
  measurePropertyValueCounts,
  measurePropertyValueSamples,
  toPropertyGroupKey,
  TPropertyProducers,
  TPropertyValueUsageInput,
  UNKNOWN_VALUE_COUNTS,
  UNKNOWN_VALUE_SAMPLES,
} from 'erxes-api-shared/core-modules';
import {
  ICustomField,
  ILocationOption,
  IPropertyField,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { sendCoreModuleProducer } from 'erxes-api-shared/utils';
import { Model, mongo } from 'mongoose';
import { nanoid } from 'nanoid';
import validator from 'validator';
import { IModels } from '~/connectionResolvers';
import { fieldSchema } from '~/modules/properties/db/definitions/field';
import {
  IField,
  IFieldDependents,
  IFieldDocument,
  IFieldUsage,
  IFieldValueUsage,
} from '../../@types';
import {
  buildFeaturedIndex,
  castFeaturedValue,
  dropFeaturedIndex,
  getFeaturedContent,
  isSameOwner,
  MAX_FEATURED_INDEXES,
  mergeFeaturedOptions,
  ownerSelector,
} from '~/modules/properties/utils/featuredFields';

export interface IFieldValueValidationOptions {
  /** Also check the value against the shape its field type implies. */
  strict?: boolean;
}
import { ORDER_GAP, TYPE_FAMILIES } from '../../constants';

// What a user may still change on a field a plugin owns.
const OWNED_FIELD_EDITABLE = [
  'name',
  'icon',
  'order',
  'isVisible',
  'isVisibleInCard',
] as const;

const assertTypeChangeAllowed = (from?: string, to?: string) => {
  if (!to || from === to) {
    return;
  }

  const sameFamily = TYPE_FAMILIES.some(
    (family) => family.includes(from || '') && family.includes(to),
  );

  if (!sameFamily) {
    throw new Error(
      `Type cannot change from ${from} to ${to}, use a new field`,
    );
  }
};

const text = (value: unknown) => (typeof value === 'string' ? value : '');

// How a sampled record is named in the usage list.
const CORE_RECORD_LABELS: Record<
  string,
  (doc: Record<string, unknown>) => string
> = {
  'core:customer': (doc) =>
    [text(doc.firstName), text(doc.lastName)].filter(Boolean).join(' ') ||
    text(doc.primaryEmail) ||
    text(doc.primaryPhone),
  'core:company': (doc) => text(doc.primaryName),
  'core:user': (doc) =>
    text((doc.details as Record<string, unknown> | undefined)?.fullName) ||
    text(doc.email),
};

export type TrackedValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | ILocationOption;

const isValidDate = (value: TrackedValue) => {
  if (value instanceof Date) {
    return true;
  }

  if (!value) {
    return false;
  }

  const stringValue = value.toString();

  return (
    validator.isISO8601(stringValue) ||
    /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/.test(
      stringValue,
    )
  );
};

const RESERVED_ROW_KEYS = new Set(['_id']);

const MULTI_VALUE_TYPES = new Set(['multiSelect', 'check']);
const SINGLE_CHOICE_TYPES = new Set(['select', 'radio']);

const normalizeChoice = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

/**
 * Check a value against the shape its field type implies.
 *
 * The `validations` map is opt-in and most fields leave it empty, so without
 * this a `date` field happily stores `тодорхойгүй` and a `select` field stores
 * an option that does not exist. Callers ask for it explicitly because
 * tightening every existing write path is a separate decision — today the
 * import path is the one that needs it.
 */
const validateValueShape = (field: IFieldDocument, value: any): void => {
  const { type, name } = field;

  if (type === 'number' && !validator.isFloat(String(value))) {
    throw new Error(`${name}: "${value}" is not a number`);
  }

  if (type === 'date' && isNaN(new Date(value).getTime())) {
    throw new Error(`${name}: "${value}" is not a date (expected YYYY-MM-DD)`);
  }

  if (type === 'boolean') {
    const accepted = ['true', 'false', 'yes', 'no', '1', '0'];

    if (!accepted.includes(normalizeChoice(value))) {
      throw new Error(`${name}: "${value}" is not true or false`);
    }
  }

  if (
    !SINGLE_CHOICE_TYPES.has(type || '') &&
    !MULTI_VALUE_TYPES.has(type || '')
  ) {
    return;
  }

  const options = (field.options || []).flatMap((option: any) =>
    typeof option === 'string'
      ? [normalizeChoice(option)]
      : [normalizeChoice(option?.value), normalizeChoice(option?.label)],
  );

  // A field with no options configured accepts anything.
  if (!options.filter(Boolean).length) {
    return;
  }

  const given = MULTI_VALUE_TYPES.has(type || '')
    ? (Array.isArray(value) ? value : String(value).split(',')).map(
        normalizeChoice,
      )
    : [normalizeChoice(value)];

  const unknownValue = given.find(
    (candidate) => candidate && !options.includes(candidate),
  );

  if (unknownValue) {
    throw new Error(
      `${name}: "${unknownValue}" is not one of ${(field.options || [])
        .map((option: any) =>
          typeof option === 'string' ? option : option?.label || option?.value,
        )
        .join(', ')}`,
    );
  }
};

export interface IFieldModel extends Model<IFieldDocument> {
  getField({ _id }: { _id: string }): Promise<IFieldDocument>;
  assertGroupAcceptsFields(groupId?: string): Promise<void>;
  createField(doc: IField, user: IUserDocument): Promise<IFieldDocument>;
  updateField(
    _id: string,
    doc: IField,
    user: IUserDocument,
  ): Promise<IFieldDocument>;
  removeField(_id: string): Promise<IFieldDocument>;
  archiveFields(ids: string[], user: IUserDocument): Promise<void>;
  restoreField(_id: string): Promise<IFieldDocument | null>;
  getFieldDependents(
    ids: string[],
    contentType: string,
  ): Promise<IFieldDependents>;
  getFieldUsage(params: {
    ids: string[];
    groupId?: string;
    contentType: string;
  }): Promise<IFieldUsage>;
  getFieldValueUsage(_id: string, value?: string): Promise<IFieldValueUsage>;
  getOptionDependents(
    _id: string,
    value: string,
  ): Promise<{ logics: string[]; segments: string[] }>;
  getFieldValueCounts(
    _id: string,
    value?: string,
  ): Promise<IPropertyValueCounts>;
  removeFields(ids: string[]): Promise<void>;

  ensureFeaturedFields(args: {
    owner: IFeaturedFieldOwner;
    contentType: string;
    group: IFeaturedFieldGroup;
    fields: IFeaturedFieldDefinition[];
  }): Promise<IFieldDocument[]>;
  releaseFeaturedFields(owner: IFeaturedFieldOwner): Promise<number>;
  setFeaturedValues(args: {
    owner: IFeaturedFieldOwner;
    contentType: string;
    records: { _id: string; values: Record<string, unknown> }[];
  }): Promise<number>;
  setFeaturedFieldsArchived(
    owner: IFeaturedFieldOwner,
    archived: boolean,
  ): Promise<number>;
  adoptFeaturedField(args: {
    fieldId: string;
    owner: IFeaturedFieldOwner;
    group: IFeaturedFieldGroup;
    field: IFeaturedFieldDefinition;
  }): Promise<{ field: IFieldDocument; recast: number; unreadable: number }>;
  keepFeaturedValues(
    next: Record<string, unknown> | undefined,
    prev: Record<string, unknown> | undefined,
  ): Promise<Record<string, unknown> | undefined>;

  validateFieldValue(
    _id: string,
    value: any,
    options?: IFieldValueValidationOptions,
  ): Promise<any>;
  validateFieldValues(
    data: any,
    options?: IFieldValueValidationOptions,
  ): Promise<any>;

  generateTypedItem(
    fieldId: string,
    value: TrackedValue,
    type: string,
    validation?: string,
    extraValue?: string,
  ): Promise<ICustomField>;

  generateTypedListFromMap(data: {
    [key: string]: TrackedValue;
  }): Promise<ICustomField[]>;

  generatePropertiesData(
    data: { [key: string]: any },
    contentType: string,
  ): Promise<{ propertiesData: IPropertyField; trackedData: ICustomField[] }>;

  syncFieldValues({
    customFieldsData,
    propertiesData,
  }: {
    customFieldsData?: ICustomField[];
    propertiesData?: IPropertyField;
  }): Promise<{
    customFieldsData: ICustomField[];
    propertiesData: IPropertyField;
  }>;
}

export const loadFieldClass = (models: IModels, subdomain: string) => {
  type TUsageQuery = Omit<TPropertyValueUsageInput, 'part'>;

  // The records' owner answers: core reads its own, a plugin is asked.
  const askPlugin = (input: TPropertyValueUsageInput, defaultValue: unknown) =>
    sendCoreModuleProducer({
      subdomain,
      moduleName: 'properties',
      pluginName: input.contentType.split(':')[0],
      producerName: TPropertyProducers.VALUE_USAGE,
      method: 'query',
      input,
      defaultValue,
    });

  const measureSamples = (
    query: TUsageQuery,
  ): Promise<IPropertyValueSamples> => {
    const input = { ...query, part: 'samples' as const };
    const content = getFeaturedContent(models, input.contentType);

    return content
      ? measurePropertyValueSamples(
          content.collection,
          input,
          CORE_RECORD_LABELS[input.contentType] ?? (() => ''),
        )
      : askPlugin(input, UNKNOWN_VALUE_SAMPLES);
  };

  const measureCounts = (query: TUsageQuery): Promise<IPropertyValueCounts> => {
    const input = { ...query, part: 'counts' as const };
    const content = getFeaturedContent(models, input.contentType);

    return content
      ? measurePropertyValueCounts(content.collection, input)
      : askPlugin(input, UNKNOWN_VALUE_COUNTS);
  };

  // A field inside a multi-entry group keeps its values on the group's rows.
  const fieldValuePath = async (field: IFieldDocument) => {
    const group = field.groupId
      ? await models.FieldsGroups.findOne(
          { _id: field.groupId },
          { configs: 1 },
        ).lean()
      : null;

    return group?.configs?.isMultiple
      ? `propertiesData.${toPropertyGroupKey(field.groupId)}.${field._id}`
      : `propertiesData.${field._id}`;
  };

  class Field {
    public static async getField({ _id }: { _id: string }) {
      const field = await models.Fields.findOne({ _id }).lean();

      if (!field) {
        throw new Error('Field not found');
      }

      return field;
    }

    // A plugin's group holds only its own featured fields.
    public static async assertGroupAcceptsFields(groupId?: string) {
      if (!groupId) {
        return;
      }

      const group = await models.FieldsGroups.findOne({ _id: groupId }).lean();

      if (group?.owner) {
        throw new Error(`Group is managed by ${group.owner.plugin}`);
      }
    }

    public static async createField(doc: IField, user: IUserDocument) {
      await this.validateField(doc);
      await models.Fields.assertGroupAcceptsFields(doc.groupId);

      const { contentType, contentTypeId, groupId } = doc;

      const order = await this.generateOrder({ contentType, contentTypeId });

      return models.Fields.create({
        ...doc,
        contentType,
        contentTypeId,
        order,
        groupId,
        isDefinedByErxes: false,
        createdBy: user._id,
      });
    }

    public static async updateField(
      _id: string,
      doc: IField,
      user: IUserDocument,
    ) {
      await this.validateField(doc, _id);

      const field = await models.Fields.getField({ _id });

      if (!field.owner && doc.groupId && doc.groupId !== field.groupId) {
        await models.Fields.assertGroupAcceptsFields(doc.groupId);
      }

      if (!field.owner) {
        if (doc.type && doc.type !== field.type) {
          const usage = await models.Fields.getFieldValueUsage(_id);

          // Nothing holds a value or depends on it, so any type fits.
          const unused =
            usage.known && !usage.samples.length && !usage.dependents.length;

          if (!unused) {
            assertTypeChangeAllowed(field.type, doc.type);
          }
        }

        if (doc.options) {
          const kept = new Set(doc.options.map(({ value }) => value));
          // Only dropping a saved option needs the slow per-option count.
          const dropsSaved = (field.options || []).some(
            ({ value }) => !kept.has(value),
          );
          const counts = dropsSaved
            ? await models.Fields.getFieldValueCounts(_id)
            : null;

          doc.options = reconcilePropertyOptions(
            field.options,
            doc.options,
            counts ? counts.byOption : [],
          );
        }
      }

      const $set = field.owner
        ? Object.fromEntries(
            OWNED_FIELD_EDITABLE.filter((key) => doc[key] !== undefined).map(
              (key) => [key, doc[key]],
            ),
          )
        : doc;

      return models.Fields.findOneAndUpdate(
        { _id },
        { $set: { ...$set, updatedBy: user._id } },
        { new: true },
      );
    }

    public static async removeField(_id: string) {
      await this.validateField({} as IField, _id);

      const field = await models.Fields.getField({ _id });

      await models.Fields.removeFields([_id]);

      return field;
    }

    // Only a field nothing uses can go; anything else is archived instead.
    public static async removeFields(ids: string[]) {
      const fields = await models.Fields.find({ _id: { $in: ids } }).lean();

      if (fields.some((field) => field.owner)) {
        throw new Error('A plugin manages one of these fields');
      }

      const contentTypes = [...new Set(fields.map((f) => f.contentType))];

      for (const contentType of contentTypes) {
        const usage = await models.Fields.getFieldUsage({
          ids: fields
            .filter((field) => field.contentType === contentType)
            .map((field) => String(field._id)),
          contentType,
        });

        if (!usage.removable) {
          throw new Error('In use or could not be checked; archive it instead');
        }
      }

      // v2 kept values here; nothing reads them, but they should not outlive the field.
      await models.Customers.updateMany(
        { 'customFieldsData.field': { $in: ids } },
        { $pull: { customFieldsData: { field: { $in: ids } } } },
      );

      await models.Fields.deleteMany({ _id: { $in: ids } });
    }

    // Quick: stops at the first records, which is all a type change needs.
    public static async getFieldValueUsage(
      _id: string,
      value?: string,
    ): Promise<IFieldValueUsage> {
      const field = await models.Fields.getField({ _id });

      const [usage, dependents] = await Promise.all([
        measureSamples({
          contentType: field.contentType,
          path: await fieldValuePath(field),
          value,
        }),
        models.Fields.getFieldDependents([_id], field.contentType),
      ]);

      return {
        ...usage,
        dependents: [
          ...dependents.fields,
          ...dependents.groups,
          ...dependents.systemFields,
        ],
      };
    }

    // What may still rely on one option; shown before it is archived.
    public static async getOptionDependents(_id: string, value: string) {
      const field = await models.Fields.getField({ _id });
      const usesOption = {
        contentType: field.contentType,
        logics: { $elemMatch: { field: _id, value } },
      };

      const [fields, groups, systemFields, segments] = await Promise.all([
        models.Fields.find(
          { ...usesOption, archivedAt: { $exists: false } },
          { name: 1 },
        ).lean(),
        models.FieldsGroups.find(
          { ...usesOption, archivedAt: { $exists: false } },
          { name: 1 },
        ).lean(),
        models.SystemFieldSettings.find(usesOption, { code: 1 }).lean(),
        // Conditions nest freely, so segments are walked rather than queried.
        // Segments carried over from v2 may have no condition tree at all.
        models.Segments.find(
          { root: { $exists: true } },
          { name: 1, root: 1 },
        ).lean(),
      ]);

      return {
        logics: [
          ...fields.map((item) => item.name),
          ...groups.map((item) => item.name),
          ...systemFields.map((item) => item.code),
        ],
        segments: segments
          .filter((segment) => segmentFiltersByOption(segment.root, _id, value))
          .map((segment) => segment.name || String(segment._id)),
      };
    }

    // Slow: may scan every record, so it is asked for on its own.
    public static async getFieldValueCounts(_id: string, value?: string) {
      const field = await models.Fields.getField({ _id });

      return measureCounts({
        contentType: field.contentType,
        path: await fieldValuePath(field),
        optionValues: (field.options || []).map((option) => option.value),
        value,
      });
    }

    public static async getFieldUsage({
      ids,
      groupId,
      contentType,
    }: {
      ids: string[];
      groupId?: string;
      contentType: string;
    }) {
      const dependents = await models.Fields.getFieldDependents(
        ids,
        contentType,
      );
      const names = [
        ...dependents.fields,
        ...dependents.groups,
        ...dependents.systemFields,
      ];

      const fields = await models.Fields.find(
        { _id: { $in: ids } },
        { groupId: 1 },
      ).lean();
      const paths = [
        ...(await Promise.all(fields.map(fieldValuePath))),
        ...(groupId ? [`propertiesData.${toPropertyGroupKey(groupId)}`] : []),
      ];

      const usages = await Promise.all(
        paths.map((path) => measureSamples({ contentType, path })),
      );

      const hasValues = usages.some((usage) => usage.samples.length > 0)
        ? true
        : usages.every((usage) => usage.known)
          ? false
          : null;

      return {
        dependents: names,
        hasValues,
        removable: !names.length && hasValues === false,
      };
    }

    // Values stay on records; archiving only stops showing the field.
    public static async archiveFields(ids: string[], user: IUserDocument) {
      const owned = await models.Fields.exists({
        _id: { $in: ids },
        owner: { $exists: true },
      });

      if (owned) {
        throw new Error('A plugin manages one of these fields');
      }

      await models.Fields.updateMany(
        { _id: { $in: ids }, archivedAt: { $exists: false } },
        { $set: { archivedAt: new Date(), archivedBy: user._id } },
      );
    }

    public static async restoreField(_id: string) {
      const field = await models.Fields.getField({ _id });
      const group = await models.FieldsGroups.findOne({
        _id: field.groupId,
      }).lean();

      if (group?.archivedAt) {
        throw new Error('Restore its group first');
      }

      return models.Fields.findOneAndUpdate(
        { _id },
        { $unset: { archivedAt: '', archivedBy: '', archivedWithGroup: '' } },
        { new: true },
      );
    }

    // What stops working while these fields are out of view.
    public static async getFieldDependents(ids: string[], contentType: string) {
      const usesField = { contentType, 'logics.field': { $in: ids } };

      const [fields, groups, systemFields] = await Promise.all([
        models.Fields.find(
          {
            ...usesField,
            _id: { $nin: ids },
            archivedAt: { $exists: false },
          },
          { name: 1 },
        ).lean(),
        models.FieldsGroups.find(
          { ...usesField, archivedAt: { $exists: false } },
          { name: 1 },
        ).lean(),
        models.SystemFieldSettings.find(usesField, { code: 1 }).lean(),
      ]);

      return {
        fields: fields.map((field) => field.name),
        groups: groups.map((group) => group.name),
        systemFields: systemFields.map((setting) => setting.code),
      };
    }

    public static async ensureFeaturedFields({
      owner,
      contentType,
      group,
      fields,
    }: {
      owner: IFeaturedFieldOwner;
      contentType: string;
      group: IFeaturedFieldGroup;
      fields: IFeaturedFieldDefinition[];
    }) {
      if (!getFeaturedContent(models, contentType)) {
        throw new Error(`Featured fields are not supported on ${contentType}`);
      }

      // One group per plugin module, shared by all of its instances.
      const { _id: groupId } = await models.FieldsGroups.ensureFeaturedGroup({
        owner: { plugin: owner.plugin, module: owner.module },
        contentType,
        group,
      });

      const ensured: IFieldDocument[] = [];

      for (const definition of fields) {
        const code = featuredFieldCode(owner, definition.key);
        const existing = await models.Fields.findOne({ code }).lean();

        if (existing && existing.contentType !== contentType) {
          throw new Error(`${code}: content type cannot change`);
        }

        if (existing && existing.type !== definition.type) {
          throw new Error(`${code}: type cannot change, use a new key`);
        }

        const field = await models.Fields.findOneAndUpdate(
          { code },
          {
            $set: {
              name: definition.name,
              type: definition.type,
              contentType,
              groupId,
              options: mergeFeaturedOptions(
                existing?.options,
                definition.options,
              ),
              owner: {
                ...owner,
                key: definition.key,
                // Re-declaring never revives an archived field; the owner does.
                status:
                  existing?.owner?.status === 'archived'
                    ? 'archived'
                    : 'active',
              },
            },
            $setOnInsert: {
              order: await this.generateOrder({ contentType }),
            },
          },
          { upsert: true, new: true, lean: true },
        );

        if (!field) {
          throw new Error(`${code}: could not be saved`);
        }

        if (definition.index && !existing?.index?.enabled) {
          const indexed = await models.Fields.countDocuments({
            contentType,
            'index.enabled': true,
          });

          if (indexed >= MAX_FEATURED_INDEXES) {
            throw new Error(
              `${code}: ${contentType} already has ${indexed} featured indexes`,
            );
          }

          // Large collections take a while; the status on the field tells.
          buildFeaturedIndex(models, field, definition.index.unique).catch(
            () => undefined,
          );
        }

        ensured.push(field);
      }

      return ensured;
    }

    public static async releaseFeaturedFields(owner: IFeaturedFieldOwner) {
      const fields = await models.Fields.find(ownerSelector(owner)).lean();

      for (const field of fields) {
        const content = getFeaturedContent(models, field.contentType);

        await dropFeaturedIndex(models, field);

        await content?.collection.updateMany(
          { [`propertiesData.${field._id}`]: { $exists: true } },
          { $unset: { [`propertiesData.${field._id}`]: '' } },
        );
      }

      await models.Fields.deleteMany(ownerSelector(owner));

      const groupIds = [...new Set(fields.map((field) => field.groupId))];
      const stillUsed = await models.Fields.distinct('groupId', {
        groupId: { $in: groupIds },
      });

      await models.FieldsGroups.deleteMany({
        _id: { $in: groupIds.filter((id) => !stillUsed.includes(id)) },
        owner: { $exists: true },
      });

      return fields.length;
    }

    public static async setFeaturedValues({
      owner,
      contentType,
      records,
    }: {
      owner: IFeaturedFieldOwner;
      contentType: string;
      records: { _id: string; values: Record<string, unknown> }[];
    }) {
      const content = getFeaturedContent(models, contentType);

      if (!content) {
        throw new Error(`Featured fields are not supported on ${contentType}`);
      }

      const keys = [
        ...new Set(records.flatMap(({ values }) => Object.keys(values))),
      ];
      const fields = await models.Fields.find({
        code: { $in: keys.map((key) => featuredFieldCode(owner, key)) },
        contentType,
      }).lean();
      const fieldsByCode = new Map(fields.map((field) => [field.code, field]));

      for (const record of records) {
        const values: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(record.values)) {
          const field = fieldsByCode.get(featuredFieldCode(owner, key));

          if (!field || !isSameOwner(field.owner, owner)) {
            throw new Error(`No featured field "${key}" for this owner`);
          }

          if (field.owner?.status === 'archived') {
            throw new Error(`${field.name} is archived`);
          }

          values[field._id] = castFeaturedValue(field, value);
        }

        await content.setPropertyValues(record._id, values);
      }

      return records.length;
    }

    // User-facing writes send the whole propertiesData back; featured values in
    // it are ignored so only their owner can change them.
    // Archived fields keep their values and stay usable in segments; their
    // owner simply stops writing to them.
    public static async setFeaturedFieldsArchived(
      owner: IFeaturedFieldOwner,
      archived: boolean,
    ) {
      const { modifiedCount } = await models.Fields.updateMany(
        ownerSelector(owner),
        { $set: { 'owner.status': archived ? 'archived' : 'active' } },
      );

      return modifiedCount;
    }

    // Takes over a field a user created for the owner's purpose, keeping its
    // _id so values already in records stay attached.
    public static async adoptFeaturedField({
      fieldId,
      owner,
      group,
      field: definition,
    }: {
      fieldId: string;
      owner: IFeaturedFieldOwner;
      group: IFeaturedFieldGroup;
      field: IFeaturedFieldDefinition;
    }) {
      const field = await models.Fields.getField({ _id: fieldId });
      const code = featuredFieldCode(owner, definition.key);

      if (field.owner && field.code !== code) {
        throw new Error(
          `${field.name} is already managed by ${field.owner.plugin}`,
        );
      }

      const content = getFeaturedContent(models, field.contentType);

      if (!content) {
        throw new Error(
          `Featured fields are not supported on ${field.contentType}`,
        );
      }

      const { _id: groupId } = await models.FieldsGroups.ensureFeaturedGroup({
        owner: { plugin: owner.plugin, module: owner.module },
        contentType: field.contentType,
        group,
      });

      const adopted = await models.Fields.findOneAndUpdate(
        { _id: fieldId },
        {
          $set: {
            code,
            name: definition.name,
            type: definition.type,
            groupId,
            options: mergeFeaturedOptions(field.options, definition.options),
            owner: { ...owner, key: definition.key, status: 'active' },
          },
        },
        { new: true, lean: true },
      );

      if (!adopted) {
        throw new Error(`${code}: could not be saved`);
      }

      // Values written before adoption may be stored as text ("1250").
      const path = `propertiesData.${fieldId}`;
      const cursor = content.collection.find(
        { [path]: { $exists: true } },
        { projection: { [path]: 1 } },
      );
      let recast = 0;
      let unreadable = 0;
      let batch: mongo.AnyBulkWriteOperation[] = [];

      for await (const record of cursor) {
        const raw = record.propertiesData?.[fieldId];
        let value: unknown;

        try {
          value = castFeaturedValue(adopted, raw);
        } catch {
          unreadable++;
          continue;
        }

        if (value !== raw) {
          batch.push({
            updateOne: {
              filter: { _id: record._id },
              update:
                value === null
                  ? { $unset: { [path]: '' } }
                  : { $set: { [path]: value } },
            },
          });
          recast++;
        }

        if (batch.length >= 500) {
          await content.collection.bulkWrite(batch);
          batch = [];
        }
      }

      if (batch.length) {
        await content.collection.bulkWrite(batch);
      }

      if (definition.index && !adopted.index?.enabled) {
        buildFeaturedIndex(models, adopted, definition.index.unique).catch(
          () => undefined,
        );
      }

      return { field: adopted, recast, unreadable };
    }

    public static async keepFeaturedValues(
      next: Record<string, unknown> | undefined,
      prev: Record<string, unknown> | undefined,
    ) {
      if (!next) {
        return next;
      }

      const ids = [
        ...new Set([...Object.keys(next), ...Object.keys(prev || {})]),
      ];
      const featured = await models.Fields.find(
        { _id: { $in: ids }, owner: { $exists: true } },
        { _id: 1 },
      ).lean();

      if (!featured.length) {
        return next;
      }

      const kept = { ...next };

      for (const { _id } of featured) {
        if (prev && prev[_id] !== undefined) {
          kept[_id] = prev[_id];
        } else {
          delete kept[_id];
        }
      }

      return kept;
    }

    public static async generateOrder({
      contentType,
      contentTypeId,
    }: {
      contentType: string;
      contentTypeId?: string;
    }) {
      const query: { [key: string]: any } = { contentType };

      if (contentTypeId) {
        query.contentTypeId = contentTypeId;
      }

      const group = await models.Fields.findOne(query).sort({
        order: -1,
      });

      return (group?.order || 0) + ORDER_GAP;
    }

    public static async validateField(doc: IField, _id?: string) {
      const { code } = doc || {};

      if (code && _id) {
        const field = await models.Fields.getField({ _id });

        if (field.code !== code) {
          const field = await models.Fields.findOne({ code }).lean();

          if (field) {
            throw new Error('Field code already exists');
          }
        }
      }

      if (code && !_id) {
        const field = await models.Fields.findOne({ code }).lean();

        if (field) {
          throw new Error('Field code already exists');
        }
      }
    }

    public static async validateFieldValue(
      _id: string,
      value: any,
      options: IFieldValueValidationOptions = {},
    ) {
      const field = await models.Fields.findOne({ _id });
      const group = await models.FieldsGroups.exists({ _id });

      if (group && value && Array.isArray(value)) {
        const rows: Array<Record<string, any>> = [];
        const seenIds = new Set<string>();

        for (const row of value as Array<Record<string, any>>) {
          for (const [key, entryValue] of Object.entries(row)) {
            if (RESERVED_ROW_KEYS.has(key)) {
              continue;
            }

            await this.validateFieldValue(key, entryValue, options);
          }

          // rows migrated from v2 arrive without an id
          const rowId =
            typeof row._id === 'string' && row._id && !seenIds.has(row._id)
              ? row._id
              : nanoid();

          seenIds.add(rowId);
          rows.push({ ...row, _id: rowId });
        }

        return rows;
      }

      if (!field) {
        throw new Error(`Field not found with the _id of ${_id}`);
      }

      const { type, validations } = field;

      if (type === 'objectList') {
        const objectListConfigs = field.configs?.objectListConfigs || [];

        if (!objectListConfigs.length) {
          throw new Error(`${field.name}: Object List don't have any keys`);
        }

        if (!value) {
          return value;
        }

        if (!Array.isArray(value)) {
          throw new TypeError(
            `${field.name}: Object List value must be a list`,
          );
        }

        const keys = new Set(objectListConfigs.map((config) => config.key));

        const normalizedRows = value
          .filter(
            (row: unknown) =>
              typeof row === 'object' && row !== null && !Array.isArray(row),
          )
          .map((row: Record<string, unknown>) =>
            Object.fromEntries(
              Object.entries(row).filter(([key]) => keys.has(key)),
            ),
          );

        if (validations?.required && normalizedRows.length === 0) {
          throw new Error(`${field.name}: required`);
        }

        return normalizedRows;
      }

      const isEmptyValue =
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && !value.length);

      for (const key in validations) {
        const validation = validations[key];

        if (!validation) continue;

        // required
        if (key === 'required') {
          if (isEmptyValue || !value.toString().trim()) {
            throw new Error(`${field.name}: required`);
          }

          continue;
        }

        // clearing a field must not be rejected as malformed
        if (isEmptyValue) {
          continue;
        }

        // email
        if (key === 'email') {
          if (!validator.isEmail(value)) {
            throw new Error(`${field.name}: Invalid email`);
          }
        }

        // number
        if (key === 'number') {
          if (
            !['check', 'radio', 'select'].includes(type || '') &&
            !validator.isFloat(value.toString())
          ) {
            throw new Error(`${field.name}: Invalid number`);
          }
        }

        // date
        if (key === 'date') {
          const dateObj = new Date(value);

          if (isNaN(dateObj.getTime())) {
            throw new Error(`${field.name}: Invalid date`);
          }
        }
      }

      if (options.strict && !isEmptyValue) {
        validateValueShape(field, value);
      }

      return value;
    }

    public static async validateFieldValues(
      data: IPropertyField,
      options: IFieldValueValidationOptions = {},
    ) {
      const result: Record<string, any> = {};

      for (const fieldName in data) {
        const fieldValue = data[fieldName];

        if (!fieldValue) {
          continue;
        }

        const isGroup = isPropertyGroupKey(fieldName);

        const field = isGroup
          ? null
          : await models.Fields.findOne({
              $or: [{ code: fieldName }, { _id: fieldName }],
            }).lean();

        const group = isGroup
          ? await models.FieldsGroups.findOne({
              _id: propertyGroupIdFromKey(fieldName),
            }).lean()
          : null;

        // no longer repeating: keep its rows instead of dropping them
        if (group && !group.configs?.isMultiple) {
          result[fieldName] = fieldValue;
          continue;
        }

        if (!field && !group) {
          continue;
        }

        const fieldId = group?._id || field?._id;

        if (!fieldId) {
          continue;
        }

        try {
          result[fieldName] = await this.validateFieldValue(
            fieldId,
            fieldValue,
            options,
          );
        } catch (e) {
          throw new Error(e.message);
        }
      }

      return result;
    }

    public static async generateTypedItem(
      fieldId: string,
      value: TrackedValue,
      type: string,
      validation?: string,
      extraValue?: string,
    ): Promise<ICustomField> {
      let typedValue: TrackedValue = value;
      let stringValue: string | undefined;
      let numberValue: number | undefined;
      let dateValue: Date | undefined;
      let locationValue: ILocationOption | undefined;

      if (value) {
        stringValue = value.toString();

        if (type === 'input' && !validation) {
          return {
            field: fieldId,
            value: stringValue,
            stringValue,
            numberValue,
            dateValue,
          };
        }

        if (type === 'map') {
          const location = value as ILocationOption;

          return {
            field: fieldId,
            value,
            stringValue: `${location.lng},${location.lat}`,
            locationValue: location,
          };
        }

        if (type !== 'check' && validator.isFloat(stringValue)) {
          numberValue = Number(value);
          typedValue = numberValue;
        }

        if (isValidDate(typedValue)) {
          const parsed = new Date(stringValue);

          if (!isNaN(parsed.getTime())) {
            dateValue = parsed;
          }
        }
      }

      return {
        field: fieldId,
        value: typedValue,
        stringValue,
        numberValue,
        dateValue,
        locationValue,
        extraValue,
      };
    }

    public static async generateTypedListFromMap(data: {
      [key: string]: TrackedValue;
    }): Promise<ICustomField[]> {
      const keys = Object.keys(data || {});

      return Promise.all(
        keys.map((key) => this.generateTypedItem(key, data[key], '')),
      );
    }

    public static async generatePropertiesData(
      data: { [key: string]: any },
      contentType: string,
    ) {
      const keys = Object.keys(data || {});

      let propertiesData: Record<string, any> = {};
      const untrackedData: Record<string, TrackedValue> = { ...(data || {}) };

      for (const key of keys) {
        const field = await models.Fields.findOne({
          contentType,
          $or: [{ code: key }, { _id: key }],
        }).lean();

        const value = data[key];

        if (field) {
          propertiesData[field._id] = value;

          delete untrackedData[key];
        }
      }

      propertiesData = await models.Fields.validateFieldValues(propertiesData);

      const trackedData =
        await models.Fields.generateTypedListFromMap(untrackedData);

      return { propertiesData, trackedData };
    }

    public static async syncFieldValues({
      customFieldsData,
      propertiesData,
    }: {
      customFieldsData?: ICustomField[];
      propertiesData?: IPropertyField;
    }) {
      const result: {
        customFieldsData: ICustomField[];
        propertiesData: IPropertyField;
      } = {
        customFieldsData: [],
        propertiesData: {},
      };

      const mergedData: Record<string, any> = {};

      for (const customFieldData of customFieldsData || []) {
        const {
          field,
          value,
          stringValue,
          numberValue,
          dateValue,
          locationValue,
          extraValue,
        } = customFieldData;

        if (!field) {
          continue;
        }

        try {
          mergedData[field] =
            value ??
            stringValue ??
            numberValue ??
            dateValue ??
            locationValue ??
            extraValue;
        } catch (e) {
          throw new Error(e.message);
        }
      }

      for (const fieldName in propertiesData || {}) {
        if (!fieldName) {
          continue;
        }

        const fieldValue = propertiesData?.[fieldName];

        if (fieldValue === undefined) {
          continue;
        }

        mergedData[fieldName] = fieldValue;
      }

      for (const mergedItem in mergedData) {
        const mergedValue = mergedData[mergedItem];

        const isGroup = isPropertyGroupKey(mergedItem);

        const field = isGroup
          ? null
          : await models.Fields.findOne({
              $or: [{ _id: mergedItem }, { code: mergedItem }],
            }).lean();

        const group = isGroup
          ? await models.FieldsGroups.findOne({
              _id: propertyGroupIdFromKey(mergedItem),
              'configs.isMultiple': true,
            }).lean()
          : null;

        if (isGroup && !group) {
          result.propertiesData[mergedItem] = mergedValue;
          continue;
        }

        const fieldId = group?._id || field?._id;

        if (!fieldId) {
          const customFieldData = (customFieldsData || []).find(
            (item) => item.field === mergedItem,
          );

          if (!customFieldData) {
            continue;
          }

          result.customFieldsData.push(customFieldData);

          continue;
        }

        const values = {};

        const { type } = field || {};

        if (['text', 'textarea'].includes(type || '')) {
          values['stringValue'] = String(mergedValue);
        }

        if (type === 'number') {
          values['numberValue'] = Number(mergedValue);
        }

        if (type === 'date') {
          values['dateValue'] = mergedValue;
        }

        if (type === 'location') {
          const { lat, lng } = mergedValue as ILocationOption;

          values['stringValue'] = String(mergedValue);
          values['locationValue'] = { type: 'Point', coordinates: [lng, lat] };
        }

        result.customFieldsData.push({
          field: mergedItem,
          value: mergedValue,
          ...values,
        });
      }

      result.propertiesData =
        await models.Fields.validateFieldValues(mergedData);

      return result;
    }
  }

  fieldSchema.loadClass(Field);

  return fieldSchema;
};
