import { getPlugin, getPlugins, getRealIdFromElk } from '../../../utils';
import {
  normalizeRecordReferenceExtensions,
  normalizeRecordReferenceTypes,
} from './normalizeRecordReferenceConfig';
import {
  TRecordReferenceExtension,
  TRecordReferenceField,
  TRecordReferenceType,
} from './types';
import { isSameRecordReferenceType } from './utils';

type TRecordReferenceMetadata = {
  types: TRecordReferenceType[];
  extensions: TRecordReferenceExtension[];
};

export type TRecordReferenceOutputField = {
  key: string;
  label: string;
  type?: string;
  field?: string;
  exposure?: 'reference';
  referenceType?: string;
  sourceType?: string;
  referenceFields?: TRecordReferenceOutputField[];
};

type TPropertyField = {
  _id: string | { toString: () => string };
  code?: string;
  label?: string;
  name?: string;
  text?: string;
  type?: string;
};

type TPropertyFieldsQuery = {
  sort: (sort: { order: 1; code: 1 }) => {
    lean: () => Promise<TPropertyField[]>;
  };
};

type TReferenceFieldsModels = {
  Fields?: {
    find: (filter: { contentType: string }) => TPropertyFieldsQuery;
  };
};

type TRecordReferencesConfigMetadata = {
  types?: TRecordReferenceType[];
  extensions?: TRecordReferenceExtension[];
};

type TGetRecordReferenceFieldsProps = {
  models?: TReferenceFieldsModels;
  type: string;
};

const findRecordReferenceType = (
  referenceTypes: TRecordReferenceType[],
  type: string,
) =>
  referenceTypes.find((referenceType) =>
    isSameRecordReferenceType(referenceType.type, type),
  );

const getRecordReferenceMetadata =
  async (): Promise<TRecordReferenceMetadata> => {
    const types: TRecordReferenceType[] = [];
    const extensions: TRecordReferenceExtension[] = [];
    const plugins = await getPlugins();

    for (const pluginName of plugins) {
      const plugin = await getPlugin(pluginName);
      const references = plugin.config?.meta
        ?.references as TRecordReferencesConfigMetadata;

      types.push(
        ...normalizeRecordReferenceTypes(pluginName, references?.types || []),
      );
      extensions.push(
        ...normalizeRecordReferenceExtensions(
          pluginName,
          references?.extensions || [],
        ),
      );
    }

    return { types, extensions };
  };

const applyRecordReferenceExtensions = ({
  extensions,
  types,
}: TRecordReferenceMetadata): TRecordReferenceType[] => {
  const referenceTypes = types.map((referenceType) => ({
    ...referenceType,
    fields: [...(referenceType.fields || [])],
  }));

  for (const extension of extensions) {
    const referenceType = referenceTypes.find((item) =>
      isSameRecordReferenceType(item.type, extension.type),
    );

    if (referenceType) {
      referenceType.fields.push(...(extension.fields || []));
      continue;
    }

    referenceTypes.push({
      type: extension.type,
      label: extension.type,
      fields: [...(extension.fields || [])],
    });
  }

  return referenceTypes;
};

const toRecordReferenceOutputField = (
  field: TRecordReferenceField,
  referenceTypes: TRecordReferenceType[],
  sourceType?: string,
): TRecordReferenceOutputField => {
  const referenceType = field.reference?.type
    ? findRecordReferenceType(referenceTypes, field.reference.type)?.type ||
      field.reference.type
    : undefined;

  return {
    key: field.key,
    label: field.label,
    exposure: field.reference || field.fields?.length ? 'reference' : undefined,
    field: field.reference?.path || field.path || field.key,
    referenceFields: field.fields?.map((nestedField) =>
      toRecordReferenceOutputField(nestedField, referenceTypes),
    ),
    referenceType,
    sourceType,
  };
};

const getCustomRecordReferenceFields = async (
  models: TReferenceFieldsModels | undefined,
  referenceType: string,
): Promise<TRecordReferenceOutputField[]> => {
  if (!models?.Fields) {
    return [];
  }

  const fields = await models.Fields.find({ contentType: referenceType })
    .sort({ order: 1, code: 1 })
    .lean();

  return fields.map((field) => {
    const fieldId = getRealIdFromElk(String(field._id));

    return {
      key: `propertiesData.${fieldId}`,
      label: field.label || field.text || field.name || field.code || fieldId,
      type: field.type,
    };
  });
};

const uniqRecordReferenceOutputFields = (
  fields: TRecordReferenceOutputField[],
) =>
  fields.filter(
    (field, index, array) =>
      array.findIndex((candidate) => candidate.key === field.key) === index,
  );

export const getRecordReferenceFields = async ({
  models,
  type,
}: TGetRecordReferenceFieldsProps): Promise<TRecordReferenceOutputField[]> => {
  const referenceTypes = applyRecordReferenceExtensions(
    await getRecordReferenceMetadata(),
  );
  const referenceType = findRecordReferenceType(referenceTypes, type);

  if (!referenceType) {
    return [];
  }

  const baseFields = referenceType.fields
    .filter((field) => {
      if (!field.reference?.type) {
        return true;
      }

      const fieldReferenceType =
        findRecordReferenceType(referenceTypes, field.reference.type)?.type ||
        field.reference.type;

      return !isSameRecordReferenceType(fieldReferenceType, referenceType.type);
    })
    .map((field) => toRecordReferenceOutputField(field, referenceTypes));
  const customFields = await getCustomRecordReferenceFields(
    models,
    referenceType.type,
  );

  return uniqRecordReferenceOutputFields([...baseFields, ...customFields]);
};
