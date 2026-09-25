import {
  isPropertyGroupKey,
  parsePropertyColumnKey,
  ParsedPropertyColumnKey,
  propertyDataPath,
  propertyGroupIdFromKey,
  toPropertyGroupKey,
  toPropertyRowColumnKey,
} from './keys';

type TPropertyData = Record<string, unknown>;

export const readPropertyDataColumn = (
  propertiesData: TPropertyData | undefined,
  column: ParsedPropertyColumnKey,
): unknown => {
  if (!propertiesData) {
    return undefined;
  }

  if (column.kind === 'field') {
    return propertiesData[column.fieldId];
  }

  const rows = propertiesData[toPropertyGroupKey(column.groupId)];

  return Array.isArray(rows)
    ? (rows[column.index - 1] as TPropertyData | undefined)?.[column.fieldId]
    : undefined;
};

export const buildPropertyDataColumns = (
  propertiesData: TPropertyData,
  formatValue: (value: unknown) => string,
): Record<string, string> => {
  const columns: Record<string, string> = {};

  for (const [key, value] of Object.entries(propertiesData || {})) {
    if (value === undefined || value === null) {
      continue;
    }

    if (!isPropertyGroupKey(key) || !Array.isArray(value)) {
      columns[propertyDataPath(key)] = formatValue(value);
      continue;
    }

    const groupId = propertyGroupIdFromKey(key);

    value.forEach((row, offset) => {
      for (const [fieldId, rowValue] of Object.entries(
        (row || {}) as TPropertyData,
      )) {
        if (fieldId === '_id' || rowValue === undefined || rowValue === null) {
          continue;
        }

        columns[toPropertyRowColumnKey(groupId, fieldId, offset + 1)] =
          formatValue(rowValue);
      }
    });
  }

  return columns;
};

/** Reassembles numbered columns into rows. Consumes the columns it reads. */
export const collectPropertyDataFromColumns = (
  doc: Record<string, unknown>,
): TPropertyData => {
  const propertiesData: TPropertyData = {};
  const rowsByGroup = new Map<string, Map<number, TPropertyData>>();

  for (const key of Object.keys(doc)) {
    const column = parsePropertyColumnKey(key);

    if (!column) {
      continue;
    }

    const value = doc[key];

    delete doc[key];

    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (column.kind === 'field') {
      propertiesData[column.fieldId] = value;
      continue;
    }

    const rows = rowsByGroup.get(column.groupId) || new Map();

    rows.set(column.index, {
      ...(rows.get(column.index) || {}),
      [column.fieldId]: value,
    });

    rowsByGroup.set(column.groupId, rows);
  }

  for (const [groupId, rows] of rowsByGroup) {
    const ordered = [...rows.entries()]
      .sort(([left], [right]) => left - right)
      .map(([, row]) => row);

    if (ordered.length) {
      propertiesData[toPropertyGroupKey(groupId)] = ordered;
    }
  }

  return propertiesData;
};

/**
 * Fold imported properties onto the ones a record already carries.
 *
 * An import row only holds the columns that particular file happened to
 * include, so writing `propertiesData` wholesale would erase every property
 * the file left out. Repeating groups merge position by position for the same
 * reason: a file that fills row 2 must not blank out row 2's other fields, and
 * rows the file never reached are kept as they were.
 */
export const mergePropertyData = (
  existing: TPropertyData | undefined,
  incoming: TPropertyData,
): TPropertyData => {
  const merged: TPropertyData = { ...(existing || {}) };

  for (const [key, value] of Object.entries(incoming)) {
    if (!isPropertyGroupKey(key) || !Array.isArray(value)) {
      merged[key] = value;
      continue;
    }

    const existingRows = Array.isArray(merged[key])
      ? (merged[key] as TPropertyData[])
      : [];

    merged[key] = [
      ...value.map((row, offset) => {
        const existingRow = existingRows[offset];

        return {
          ...(existingRow || {}),
          ...((row || {}) as TPropertyData),
          // A row keeps the identity it was created with; an imported row
          // carries no id of its own and must not mint a new one.
          ...(existingRow?._id ? { _id: existingRow._id } : {}),
        };
      }),
      ...existingRows.slice(value.length),
    ];
  }

  return merged;
};
