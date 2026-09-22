import {
  TRecordReferenceExtension,
  TRecordReferenceField,
  TRecordReferenceType,
  TRecordReferencesConfig,
} from './types';
import { normalizeRecordReferenceType } from './utils';

export const normalizeRecordReferenceField = (
  pluginName: string,
  field: TRecordReferenceField,
): TRecordReferenceField => ({
  ...field,
  fields: (field.fields || []).map((nestedField) =>
    normalizeRecordReferenceField(pluginName, nestedField),
  ),
  reference: field.reference
    ? {
        ...field.reference,
        type: normalizeRecordReferenceType(pluginName, field.reference.type),
      }
    : undefined,
});

export const normalizeRecordReferenceTypes = (
  pluginName: string,
  types: TRecordReferenceType[] = [],
): TRecordReferenceType[] =>
  types.map((referenceType) => ({
    ...referenceType,
    type: normalizeRecordReferenceType(pluginName, referenceType.type),
    fields: (referenceType.fields || []).map((field) =>
      normalizeRecordReferenceField(pluginName, field),
    ),
  }));

export const normalizeRecordReferenceExtensions = (
  pluginName: string,
  extensions: TRecordReferenceExtension[] = [],
): TRecordReferenceExtension[] =>
  extensions.map((extension) => ({
    ...extension,
    type: normalizeRecordReferenceType(pluginName, extension.type),
    fields: (extension.fields || []).map((field) =>
      normalizeRecordReferenceField(pluginName, field),
    ),
  }));

export const normalizeRecordReferenceConfig = (
  pluginName: string,
  config: TRecordReferencesConfig,
) => ({
  types: normalizeRecordReferenceTypes(pluginName, config.types || []),

  extensions: normalizeRecordReferenceExtensions(
    pluginName,
    config.extensions || [],
  ),
});
