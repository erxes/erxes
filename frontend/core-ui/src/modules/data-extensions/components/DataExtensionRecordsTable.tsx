import {
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { Button, cn, Skeleton, Table } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataExtensionValueDisplay,
  formatDataExtensionValue,
  IDataExtensionField,
  IDataExtensionFilter,
  IDataExtensionListRecord,
  IDataExtensionRecordType,
  useDataExtensionAggregate,
  useDataExtensionRecordList,
  useDataExtensionRecordTypes,
} from 'ui-modules';
import { DataExtensionObjectIcon } from './DataExtensionObjectIcon';

const PAGE_SIZE = 30;
/** Columns shown when a view does not pick its own. */
const DEFAULT_COLUMNS = 6;
/** Types a list can sort by: one comparable value per record. */
const SORTABLE_TYPES: IDataExtensionField['type'][] = [
  'text',
  'number',
  'date',
  'dateTime',
  'boolean',
  'select',
  'email',
  'phone',
  'url',
  'rating',
  'percent',
];
/** Columns the footer totals. */
const TOTAL_TYPES: IDataExtensionField['type'][] = ['number', 'currency', 'percent'];

export type RecordsSort = { field: string; direction: 1 | -1 };

const SortableHead = ({
  label,
  field,
  sort,
  onSort,
}: {
  label: string;
  field?: string;
  sort: RecordsSort;
  onSort: (sort: RecordsSort) => void;
}) => {
  const active = field && sort.field === field;
  const Icon = sort.direction === 1 ? IconSortAscending : IconSortDescending;

  if (!field) {
    return <Table.Head>{label}</Table.Head>;
  }

  return (
    <Table.Head
      aria-sort={active ? (sort.direction === 1 ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-sm [font:inherit] [letter-spacing:inherit] [text-transform:inherit] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() =>
          onSort({ field, direction: active && sort.direction === 1 ? -1 : 1 })
        }
      >
        {label}
        {active && <Icon className="size-3.5" aria-hidden="true" />}
      </button>
    </Table.Head>
  );
};

/**
 * One page of a custom object's records under a view's filter and sort,
 * with totals for its number and money columns. One request per page and
 * one for the totals, never one per row.
 */
export const DataExtensionRecordsTable = ({
  recordType,
  fields,
  filter,
  searchValue,
  columnKeys,
  sort,
  onSortChange,
  onOpen,
  onCreate,
  version,
}: {
  recordType: IDataExtensionRecordType;
  fields: IDataExtensionField[];
  filter: IDataExtensionFilter;
  searchValue?: string;
  /** A view's own columns, in order; the first fields otherwise. */
  columnKeys?: string[] | null;
  sort: RecordsSort;
  onSortChange: (sort: RecordsSort) => void;
  onOpen: (id: string) => void;
  onCreate?: () => void;
  version: number;
}) => {
  const { t, i18n } = useTranslation('dataExtensions');
  const { recordTypes } = useDataExtensionRecordTypes();
  const [page, setPage] = useState(0);
  const columns = useMemo(() => {
    if (columnKeys?.length) {
      return columnKeys
        .map((key) => fields.find((field) => field.key === key))
        .filter((field): field is IDataExtensionField => Boolean(field));
    }

    return fields.filter((field) => field.type !== 'json').slice(0, DEFAULT_COLUMNS);
  }, [fields, columnKeys]);
  const totalColumns = useMemo(
    () => columns.filter((field) => TOTAL_TYPES.includes(field.type)),
    [columns],
  );
  const { records, totalCount, loading, error, refetch } = useDataExtensionRecordList(
    recordType,
    fields,
    recordTypes,
    {
      filter,
      searchValue,
      limit: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      sortField: sort.field,
      sortDirection: sort.direction,
    },
  );
  const { groups: totals, refetch: refetchTotals } = useDataExtensionAggregate(recordType, {
    filter,
    metrics: totalColumns.map((field) => ({ op: 'sum' as const, field: field.key })),
    skip: !totalColumns.length,
  });
  const pages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
  const singular = recordType.singularLabel || recordType.label;
  const filterKey = JSON.stringify(filter);

  useEffect(() => setPage(0), [searchValue, sort, filterKey, recordType.recordType]);

  useEffect(() => {
    refetch();
    refetchTotals();
    // Bumped by the parent after a record changed in its sheet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]);

  const totalOf = (field: IDataExtensionField) => {
    const index = totalColumns.indexOf(field);
    const amount = totals[0]?.values[index];

    if (index < 0 || typeof amount !== 'number') {
      return '';
    }

    return formatDataExtensionValue(
      field,
      field.type === 'currency'
        ? { amount, currency: field.settings?.currency || 'MNT' }
        : amount,
      { locale: i18n.language },
    );
  };

  if (error) {
    return (
      <div
        role="alert"
        className="m-3 flex flex-col items-center gap-3 rounded-md border border-dashed p-10 text-center"
      >
        <IconAlertCircle className="size-6 text-destructive" aria-hidden="true" />
        <p className="text-sm">{error.message}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  const filtered = Boolean(searchValue) || filter.conditions.length > 0;

  if (!loading && !records.length) {
    return (
      <div className="m-3 flex flex-col items-center gap-3 rounded-md border border-dashed p-10 text-center">
        <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <DataExtensionObjectIcon icon={recordType.icon} className="size-5" />
        </span>
        <p className="text-sm font-medium">
          {filtered ? t('records.no-matches') : t('records.empty', { label: recordType.label })}
        </p>
        {!filtered && (
          <p className="max-w-sm text-sm text-muted-foreground">
            {t('records.empty-hint', { label: singular })}
          </p>
        )}
        {!filtered && onCreate && (
          <Button onClick={onCreate}>
            <IconPlus />
            {t('records.new', { label: singular })}
          </Button>
        )}
      </div>
    );
  }

  const firstShown = totalCount ? page * PAGE_SIZE + 1 : 0;
  const lastShown = Math.min((page + 1) * PAGE_SIZE, totalCount);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 p-3">
      <div
        className={cn(
          'min-h-0 flex-auto overflow-auto rounded-md border transition-opacity',
          loading && 'opacity-70',
        )}
      >
        <Table>
          <Table.Header className="sticky top-0 z-10 bg-background">
            <Table.Row>
              <SortableHead label={t('records.name')} field="name" sort={sort} onSort={onSortChange} />
              {columns.map((field) => (
                <SortableHead
                  key={field._id}
                  label={field.label}
                  field={
                    SORTABLE_TYPES.includes(field.type) && !field.relation
                      ? `dataExtensions.${field.key}`
                      : undefined
                  }
                  sort={sort}
                  onSort={onSortChange}
                />
              ))}
              <SortableHead label={t('records.updated')} field="updatedAt" sort={sort} onSort={onSortChange} />
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {loading && !records.length
              ? Array.from({ length: 6 }, (_, index) => (
                  <Table.Row key={index}>
                    <Table.Cell colSpan={columns.length + 2}>
                      <Skeleton className="h-5 w-full" />
                    </Table.Cell>
                  </Table.Row>
                ))
              : records.map((record: IDataExtensionListRecord) => (
                  <Table.Row
                    key={record._id}
                    tabIndex={0}
                    className="cursor-pointer hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
                    onClick={() => onOpen(record._id)}
                    onKeyDown={(event) => event.key === 'Enter' && onOpen(record._id)}
                  >
                    <Table.Cell className="max-w-64 truncate font-medium">{record.name}</Table.Cell>
                    {columns.map((field) => (
                      <Table.Cell key={field._id} className="max-w-56 overflow-hidden">
                        <DataExtensionValueDisplay
                          field={field}
                          value={record.values[field.key] ?? null}
                          links={record.links[field.key]}
                          className="max-w-full"
                        />
                      </Table.Cell>
                    ))}
                    <Table.Cell className="whitespace-nowrap text-muted-foreground">
                      {record.updatedAt
                        ? new Date(record.updatedAt).toLocaleDateString(i18n.language)
                        : '—'}
                    </Table.Cell>
                  </Table.Row>
                ))}
          </Table.Body>
          {totalColumns.length > 0 && (
            <Table.Footer className="sticky bottom-0 bg-background">
              <Table.Row>
                <Table.Cell className="text-xs font-medium text-muted-foreground">
                  {t('records.total')}
                </Table.Cell>
                {columns.map((field) => (
                  <Table.Cell key={field._id} className="whitespace-nowrap text-sm font-medium tabular-nums">
                    {totalOf(field)}
                  </Table.Cell>
                ))}
                <Table.Cell />
              </Table.Row>
            </Table.Footer>
          )}
        </Table>
      </div>
      {totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <span className="tabular-nums">
            {t('records.range', { from: firstShown, to: lastShown, total: totalCount })}
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page === 0}
            aria-label={t('records.previous')}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
          >
            <IconChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="icon"
            disabled={page + 1 >= pages}
            aria-label={t('records.next')}
            onClick={() => setPage((current) => current + 1)}
          >
            <IconChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
};
