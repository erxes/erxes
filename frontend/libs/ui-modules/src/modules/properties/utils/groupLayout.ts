import { IField, IFieldGroup } from '../types/fieldsTypes';

export interface IGroupRow {
  fields: IField[];
  columns: number;
}

export const MAX_PER_ROW = 4;

// Types whose content needs a full row when no layout places them.
const WIDE_TYPES = new Set(['list', 'objectList', 'textarea', 'editor']);

const readLayout = (group: IFieldGroup): string[][] | null => {
  const layout = group.configs?.layout;

  if (!Array.isArray(layout)) {
    return null;
  }

  return layout
    .filter(Array.isArray)
    .map((row: unknown[]) =>
      row.filter((id): id is string => typeof id === 'string'),
    );
};

// The flow before layouts existed: two per row, long types alone.
const defaultRows = (fields: IField[]): IGroupRow[] => {
  const rows: IGroupRow[] = [];
  let pending: IField[] = [];

  const flush = () => {
    if (pending.length) {
      rows.push({ fields: pending, columns: 2 });
      pending = [];
    }
  };

  for (const field of fields) {
    if (WIDE_TYPES.has(field.type)) {
      flush();
      rows.push({ fields: [field], columns: 1 });
      continue;
    }

    pending.push(field);

    if (pending.length === 2) {
      flush();
    }
  }

  flush();

  return rows;
};

const chunk = (fields: IField[]) =>
  Array.from({ length: Math.ceil(fields.length / MAX_PER_ROW) }, (_, i) =>
    fields.slice(i * MAX_PER_ROW, (i + 1) * MAX_PER_ROW),
  );

export const buildGroupRows = (
  group: IFieldGroup,
  fields: IField[],
): IGroupRow[] => {
  const layout = readLayout(group);

  if (!layout) {
    return defaultRows(fields);
  }

  const byId = new Map(fields.map((field) => [field._id, field]));
  const placed = new Set<string>();

  const rows = layout.flatMap((ids) => {
    const rowFields = ids.flatMap((id) => {
      const field = byId.get(id);

      if (!field || placed.has(id)) {
        return [];
      }

      placed.add(id);

      return [field];
    });

    return chunk(rowFields).map((part) => ({
      fields: part,
      columns: part.length,
    }));
  });

  // Fields added after the layout was saved still show, in the default flow.
  return [
    ...rows,
    ...defaultRows(fields.filter((field) => !placed.has(field._id))),
  ];
};
