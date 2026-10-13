import {
  featuredFieldCode,
  IFeaturedFieldDefinition,
  IFeaturedFieldOwner,
  IPropertyMeta,
} from 'erxes-api-shared/core-modules';
import { getPlugin, getPlugins } from 'erxes-api-shared/utils';
import { Collection } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { FieldOption, IFieldDocument } from '~/modules/properties/@types';

type TPropertyValueWriter = (
  _id: string,
  values: Record<string, unknown>,
) => Promise<unknown>;

type TFeaturedContent = {
  collection: Collection;
  setPropertyValues: TPropertyValueWriter;
};

// Record-owning content types whose writes go through a model method that
// emits db events. Plugin content types need the record owner's own API.
export const getFeaturedContent = (
  models: IModels,
  contentType: string,
): TFeaturedContent | null => {
  switch (contentType) {
    case 'core:customer':
      return {
        collection: models.Customers.collection,
        setPropertyValues: (_id, values) =>
          models.Customers.setPropertyValues(_id, values),
      };
    case 'core:company':
      return {
        collection: models.Companies.collection,
        setPropertyValues: (_id, values) =>
          models.Companies.setPropertyValues(_id, values),
      };
    case 'core:user':
      return {
        collection: models.Users.collection,
        setPropertyValues: (_id, values) =>
          models.Users.setPropertyValues(_id, values),
      };
    default:
      return null;
  }
};

export const ownerSelector = (owner: IFeaturedFieldOwner) => ({
  'owner.plugin': owner.plugin,
  'owner.module': owner.module,
  'owner.refId': owner.refId ?? null,
});

export const isSameOwner = (a?: IFeaturedFieldOwner, b?: IFeaturedFieldOwner) =>
  !!a &&
  !!b &&
  a.plugin === b.plugin &&
  a.module === b.module &&
  (a.refId ?? null) === (b.refId ?? null);

// Options an owner stops declaring stay as deprecated: records may hold them.
export const mergeFeaturedOptions = (
  stored: FieldOption[] = [],
  declared: IFeaturedFieldDefinition['options'] = [],
): FieldOption[] => {
  const declaredValues = new Set(declared.map(({ value }) => value));

  const kept = stored
    .filter(({ value }) => !declaredValues.has(value))
    .map((option) => ({ ...option, deprecated: true }));

  return [...declared.map(({ label, value }) => ({ label, value })), ...kept];
};

const activeOptionValues = (field: IFieldDocument) =>
  new Set(
    (field.options || [])
      .filter(({ deprecated }) => !deprecated)
      .map(({ value }) => value),
  );

// Typed values are what make an index and range queries on the field useful.
export const castFeaturedValue = (field: IFieldDocument, value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  switch (field.type) {
    case 'number': {
      const number = Number(value);

      if (!Number.isFinite(number)) {
        throw new Error(`${field.code}: "${value}" is not a number`);
      }

      return number;
    }
    case 'boolean':
      if (typeof value === 'boolean') {
        return value;
      }

      if (['true', '1'].includes(String(value).toLowerCase())) {
        return true;
      }

      if (['false', '0'].includes(String(value).toLowerCase())) {
        return false;
      }

      throw new Error(`${field.code}: "${value}" is not true or false`);
    case 'date': {
      const date = new Date(value as string);

      if (Number.isNaN(date.getTime())) {
        throw new Error(`${field.code}: "${value}" is not a date`);
      }

      return date;
    }
    case 'select': {
      const choice = String(value);

      if (!activeOptionValues(field).has(choice)) {
        throw new Error(`${field.code}: "${choice}" is not an option`);
      }

      return choice;
    }
    case 'multiSelect': {
      const allowed = activeOptionValues(field);
      const choices = (Array.isArray(value) ? value : [value]).map(String);
      const invalid = choices.find((choice) => !allowed.has(choice));

      if (invalid) {
        throw new Error(`${field.code}: "${invalid}" is not an option`);
      }

      return choices;
    }
    default:
      return String(value);
  }
};

export const featuredIndexName = (fieldId: string) => `pd_${fieldId}`;

// Mongo caps a collection at 64 indexes; featured fields get a share of it.
export const MAX_FEATURED_INDEXES = 20;

export const buildFeaturedIndex = async (
  models: IModels,
  field: IFieldDocument,
  unique?: boolean,
) => {
  const content = getFeaturedContent(models, field.contentType);

  if (!content) {
    return;
  }

  const path = `propertiesData.${field._id}`;

  await models.Fields.updateOne(
    { _id: field._id },
    {
      $set: { index: { enabled: true, unique: !!unique, status: 'building' } },
    },
  );

  try {
    await content.collection.createIndex(
      { [path]: 1 },
      {
        name: featuredIndexName(field._id),
        unique: !!unique,
        partialFilterExpression: { [path]: { $exists: true } },
      },
    );

    await models.Fields.updateOne(
      { _id: field._id },
      { $set: { 'index.status': 'ready' } },
    );
  } catch (error) {
    await models.Fields.updateOne(
      { _id: field._id },
      { $set: { 'index.status': 'failed' } },
    );

    throw error;
  }
};

export const dropFeaturedIndex = async (
  models: IModels,
  field: IFieldDocument,
) => {
  const content = getFeaturedContent(models, field.contentType);

  if (!content || !field.index?.enabled) {
    return;
  }

  const indexes = await content.collection.indexes();

  if (indexes.some(({ name }) => name === featuredIndexName(field._id))) {
    await content.collection.dropIndex(featuredIndexName(field._id));
  }
};

const reconciledSignatures = new Map<string, string>();

// Plugins declare fields in meta; stored ones they stop declaring are marked
// orphaned rather than deleted, since records still hold their values.
export const reconcileDeclaredFeaturedFields = async (
  models: IModels,
  subdomain: string,
) => {
  const declarations = await Promise.all(
    (
      await getPlugins()
    ).map(async (plugin) => {
      const meta: IPropertyMeta | undefined = (await getPlugin(plugin))?.config
        ?.meta?.properties;

      return { plugin, declared: meta?.featuredFields || [] };
    }),
  );

  const signature = JSON.stringify(declarations);

  if (reconciledSignatures.get(subdomain) === signature) {
    return;
  }

  for (const { plugin, declared } of declarations) {
    const codes: string[] = [];

    for (const { contentType, module, group, fields } of declared) {
      await models.Fields.ensureFeaturedFields({
        owner: { plugin, module },
        contentType,
        group,
        fields,
      });

      codes.push(
        ...fields.map(({ key }) => featuredFieldCode({ plugin, module }, key)),
      );
    }

    await models.Fields.updateMany(
      {
        'owner.plugin': plugin,
        'owner.refId': null,
        code: { $nin: codes },
      },
      { $set: { 'owner.status': 'orphaned' } },
    );
  }

  reconciledSignatures.set(subdomain, signature);
};
