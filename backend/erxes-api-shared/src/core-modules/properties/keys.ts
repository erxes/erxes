// A `propertiesData` key is a bare field id or a prefixed group id. `:`, `/`
// and `~` never occur in a nanoid, so no split can hit an id.
export const PROPERTIES_DATA = 'propertiesData';

export const PROPERTY_GROUP_KEY_PREFIX = 'g:';

export const PROPERTY_ROW_KEY_SEP = '/';

// Same key, but the condition stands on its own row instead of joining its
// siblings in one $elemMatch.
export const PROPERTY_ANY_ROW_KEY_SEP = '~';

export const toPropertyGroupKey = (groupId: string) =>
  `${PROPERTY_GROUP_KEY_PREFIX}${groupId}`;

export const isPropertyGroupKey = (key: string) =>
  key.startsWith(PROPERTY_GROUP_KEY_PREFIX);

export const propertyGroupIdFromKey = (key: string) =>
  key.slice(PROPERTY_GROUP_KEY_PREFIX.length);

export const propertyDataPath = (key: string, prefix = PROPERTIES_DATA) =>
  `${prefix}.${key}`;

export const toPropertyRowKey = (
  groupId: string,
  fieldId: string,
  anyRow = false,
) =>
  `${toPropertyGroupKey(groupId)}${
    anyRow ? PROPERTY_ANY_ROW_KEY_SEP : PROPERTY_ROW_KEY_SEP
  }${fieldId}`;

export type ParsedPropertyDataKey =
  | { kind: 'field'; fieldId: string }
  | { kind: 'row'; groupId: string; fieldId: string; anyRow: boolean };

export const parsePropertyDataKey = (key: string): ParsedPropertyDataKey => {
  if (!isPropertyGroupKey(key)) {
    return { kind: 'field', fieldId: key };
  }

  const rest = propertyGroupIdFromKey(key);
  const sameRowSep = rest.indexOf(PROPERTY_ROW_KEY_SEP);
  const anyRowSep = rest.indexOf(PROPERTY_ANY_ROW_KEY_SEP);

  const sep =
    sameRowSep === -1 || (anyRowSep !== -1 && anyRowSep < sameRowSep)
      ? anyRowSep
      : sameRowSep;

  if (sep === -1) {
    return { kind: 'field', fieldId: key };
  }

  return {
    kind: 'row',
    groupId: rest.slice(0, sep),
    fieldId: rest.slice(sep + 1),
    anyRow: rest[sep] === PROPERTY_ANY_ROW_KEY_SEP,
  };
};

export const isPropertyDataPath = (field: string, prefix = PROPERTIES_DATA) =>
  field.includes(`${prefix}.`);

export const fieldIdFromPropertyDataPath = (
  field: string,
  prefix = PROPERTIES_DATA,
) => field.replace(`${prefix}.`, '');

export const propertyDataExistsFilter = (
  fieldIds: string[],
  prefix = PROPERTIES_DATA,
) => ({
  $or: fieldIds.map((fieldId) => ({
    [propertyDataPath(fieldId, prefix)]: { $exists: true },
  })),
});

export const propertyDataRegexFilter = (
  fieldId: string,
  regex: RegExp,
  prefix = PROPERTIES_DATA,
) => ({ [propertyDataPath(fieldId, prefix)]: { $regex: regex } });

// A row cannot fit one spreadsheet cell, so each gets a numbered column.
export const PROPERTY_ROW_INDEX_SEP = '#';

export const toPropertyRowColumnKey = (
  groupId: string,
  fieldId: string,
  index: number,
) =>
  `${propertyDataPath(
    toPropertyRowKey(groupId, fieldId),
  )}${PROPERTY_ROW_INDEX_SEP}${index}`;

export type ParsedPropertyColumnKey =
  | { kind: 'field'; fieldId: string }
  | { kind: 'row'; groupId: string; fieldId: string; index: number };

export const parsePropertyColumnKey = (
  columnKey: string,
): ParsedPropertyColumnKey | null => {
  if (!columnKey.startsWith(`${PROPERTIES_DATA}.`)) {
    return null;
  }

  const rest = columnKey.slice(PROPERTIES_DATA.length + 1);
  const sep = rest.lastIndexOf(PROPERTY_ROW_INDEX_SEP);
  const index = sep === -1 ? NaN : Number(rest.slice(sep + 1));

  const key = parsePropertyDataKey(
    Number.isInteger(index) && index > 0 ? rest.slice(0, sep) : rest,
  );

  if (key.kind !== 'row') {
    return { kind: 'field', fieldId: key.fieldId };
  }

  return {
    kind: 'row',
    groupId: key.groupId,
    fieldId: key.fieldId,
    index: Number.isInteger(index) && index > 0 ? index : 1,
  };
};
