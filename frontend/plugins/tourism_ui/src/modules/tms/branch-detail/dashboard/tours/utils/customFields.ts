export type CustomFieldValue = string | boolean | string[] | null | undefined;

export interface TourCustomFieldData {
  field: string;
  value?: CustomFieldValue;
}

export const filterCustomFieldsData = (
  fields?: TourCustomFieldData[],
): TourCustomFieldData[] | undefined => {
  const filtered = fields?.filter((item) => {
    if (item.value === '' || item.value === null || item.value === undefined) {
      return false;
    }

    return !Array.isArray(item.value) || item.value.length > 0;
  });

  return filtered?.length ? filtered : undefined;
};
