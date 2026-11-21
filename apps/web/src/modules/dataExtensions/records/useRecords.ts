import type { DataExtensionField, DataExtensionRecord } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import type { TListFilterField, TRecordTableSort } from 'erxes-ui';
import { useListFilterParams } from 'erxes-ui';
import { parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs';
import { useCursorList } from '~/lib/cursorList';
import { FIELD_TYPES } from '../fieldTypes';

/** Types a list sorts by: one plain value per record. */
const SORTABLE = new Set<string>([
  'text',
  'number',
  'percent',
  'rating',
  'boolean',
  'date',
  'dateTime',
  'select',
  'email',
  'phone',
  'url',
  'autoNumber',
  'formula',
  'rollup',
]);

export const sortableKeys = (fields: DataExtensionField[]) => [
  ...fields.filter((field) => SORTABLE.has(field.type)).map((field) => field.key),
  'createdAt',
  'updatedAt',
];

const sortQuery = {
  sort: parseAsString,
  dir: parseAsStringLiteral(['asc', 'desc'] as const),
};

/** The list's order, kept in the URL (`?sort=amount&dir=asc`); newest first by default. */
export const useRecordSort = () => {
  const [{ sort, dir }, setSort] = useQueryStates(sortQuery);

  return {
    sort: sort ? { by: sort, direction: dir ?? 'asc' } : null,
    setSort: (next: TRecordTableSort | null) =>
      void setSort({ sort: next?.by ?? null, dir: next?.direction ?? null }),
  };
};

/** An object's records as the list shows them: searched, filtered and sorted. */
export const useRecords = (objectKey: string) => {
  const { search, filter } = useListFilterParams();
  const { sort } = useRecordSort();

  const filters = {
    search,
    filter,
    sortField: sort?.by ?? 'createdAt',
    sortDirection: sort?.direction ?? 'desc',
  };

  return useCursorList<DataExtensionRecord>({
    sessionKey: `data_records_${objectKey}`,
    filters,
    options: (paging) =>
      orpc.dataRecords.list.infiniteOptions({
        input: (page) => ({ ...page, ...filters, objectKey }),
        ...paging,
      }),
  });
};

/** How a field filters: the filter's kind for its type; none for composite values. */
const FILTER_TYPES: Partial<Record<DataExtensionField['type'], TListFilterField['type']>> = {
  text: 'text',
  longText: 'text',
  email: 'text',
  phone: 'text',
  url: 'text',
  autoNumber: 'text',
  number: 'number',
  percent: 'number',
  rating: 'number',
  rollup: 'number',
  date: 'date',
  dateTime: 'date',
  boolean: 'boolean',
  select: 'select',
  multiSelect: 'select',
  member: 'member',
};

/** The fields `ListFilter` offers: `subject.<key>`, each by its type. */
export const filterFields = (fields: DataExtensionField[]): TListFilterField[] =>
  fields.flatMap((field) => {
    const type = FILTER_TYPES[field.type];

    return type
      ? [
          {
            path: `subject.${field.key}`,
            label: field.label,
            type,
            icon: FIELD_TYPES[field.type].icon,
            options: field.options.map((option) => ({ value: option.value, label: option.label })),
          },
        ]
      : [];
  });
