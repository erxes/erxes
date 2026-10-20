import { FieldDefinition } from '../../posts/CustomFieldInput';

const isFieldDefinition = (value: unknown): value is FieldDefinition =>
  typeof value === 'object' &&
  value !== null &&
  '_id' in value &&
  typeof value._id === 'string' &&
  'type' in value &&
  typeof value.type === 'string' &&
  'label' in value &&
  typeof value.label === 'string';

export const toFieldDefinitions = (fields: unknown): FieldDefinition[] =>
  Array.isArray(fields) ? fields.filter(isFieldDefinition) : [];
