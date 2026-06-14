import { TRecordReferencesConfig } from './types';
import { normalizeRecordReferenceType } from './utils';

export const normalizeRecordReferenceConfig = (
  pluginName: string,
  config: TRecordReferencesConfig,
) => ({
  types: (config.types || []).map((referenceType) => ({
    ...referenceType,
    type: normalizeRecordReferenceType(pluginName, referenceType.type),
    fields: (referenceType.fields || []).map((field) => ({
      ...field,
      reference: field.reference
        ? {
            ...field.reference,
            type: normalizeRecordReferenceType(
              pluginName,
              field.reference.type,
            ),
          }
        : undefined,
    })),
  })),
});
