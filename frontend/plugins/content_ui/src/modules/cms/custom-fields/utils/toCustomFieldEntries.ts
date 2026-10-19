import { CustomFieldValue } from '../../posts/CustomFieldInput';

export type CustomFieldEntry = { field: string; value: CustomFieldValue };

/** Reads saved custom field values from their JSON scalar. */
export const toCustomFieldEntries = (
  customFieldsData: unknown,
): CustomFieldEntry[] =>
  Array.isArray(customFieldsData)
    ? (customFieldsData as CustomFieldEntry[])
    : [];
