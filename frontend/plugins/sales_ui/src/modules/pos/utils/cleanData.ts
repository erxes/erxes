const cleanValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(cleanValue);
  if (value !== null && typeof value === 'object') return cleanData(value);
  return value;
};

// Strip Apollo metadata and null embedded IDs without dropping configuration
// values or extension keys. All callers save JSON configuration objects.
export const cleanData = (data: object): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(data)
      .filter(
        ([key, value]) =>
          key !== '__typename' && !(key === '_id' && value === null),
      )
      .map(([key, value]) => [key, cleanValue(value)]),
  );
