import { IField, IFieldGroup } from '../types/fieldsTypes';

export interface IGroupRow {
  fields: IField[];
  columns: number;
}

export interface ILayoutRow<T> {
  items: T[];
  columns: number;
}

export const MAX_PER_ROW = 4;

// Types whose content needs a full row when no layout places them.
const WIDE_TYPES = new Set(['list', 'objectList', 'textarea', 'editor']);

export const isWideType = (type?: string) => WIDE_TYPES.has(type || '');

export const readLayout = (value: unknown): string[][] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .filter(Array.isArray)
    .map((row: unknown[]) =>
      row.filter((id): id is string => typeof id === 'string'),
    );
};

// The flow before layouts existed: two per row, long types alone.
const defaultRows = <T>(
  items: T[],
  isWide: (item: T) => boolean,
): ILayoutRow<T>[] => {
  const rows: ILayoutRow<T>[] = [];
  let pending: T[] = [];

  const flush = () => {
    if (pending.length) {
      rows.push({ items: pending, columns: 2 });
      pending = [];
    }
  };

  for (const item of items) {
    if (isWide(item)) {
      flush();
      rows.push({ items: [item], columns: 1 });
      continue;
    }

    pending.push(item);

    if (pending.length === 2) {
      flush();
    }
  }

  flush();

  return rows;
};

const chunk = <T>(items: T[]) =>
  Array.from({ length: Math.ceil(items.length / MAX_PER_ROW) }, (_, i) =>
    items.slice(i * MAX_PER_ROW, (i + 1) * MAX_PER_ROW),
  );

export const buildLayoutRows = <T>({
  layout,
  items,
  getId,
  isWide,
}: {
  layout: string[][] | null;
  items: T[];
  getId: (item: T) => string;
  isWide: (item: T) => boolean;
}): ILayoutRow<T>[] => {
  if (!layout) {
    return defaultRows(items, isWide);
  }

  const byId = new Map(items.map((item) => [getId(item), item]));
  const placed = new Set<string>();

  const rows = layout.flatMap((ids) => {
    const rowItems = ids.flatMap((id) => {
      const item = byId.get(id);

      if (!item || placed.has(id)) {
        return [];
      }

      placed.add(id);

      return [item];
    });

    return chunk(rowItems).map((part) => ({
      items: part,
      columns: part.length,
    }));
  });

  // Items added after the layout was saved still show, in the default flow.
  return [
    ...rows,
    ...defaultRows(
      items.filter((item) => !placed.has(getId(item))),
      isWide,
    ),
  ];
};

export const buildGroupRows = (
  group: IFieldGroup,
  fields: IField[],
): IGroupRow[] =>
  buildLayoutRows({
    layout: readLayout(group.configs?.layout),
    items: fields,
    getId: (field) => field._id,
    isWide: (field) => isWideType(field.type),
  }).map(({ items, columns }) => ({ fields: items, columns }));
