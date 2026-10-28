export const PER_TYPE_PROPERTY_CONTENT_TYPES: Record<string, string> = {
  'core:structureEntity': '/settings/structures',
};

export const getPerTypePropertiesPath = (
  contentType: string,
  contentTypeId?: string,
) => (contentTypeId ? undefined : PER_TYPE_PROPERTY_CONTENT_TYPES[contentType]);
