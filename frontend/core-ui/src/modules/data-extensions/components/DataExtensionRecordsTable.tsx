import {
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  IconSearch,
  IconSortAscending,
  IconSortDescending,
} from '@tabler/icons-react';
import { Button, cn, Input, Skeleton, Table } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataExtensionValueDisplay,
  IDataExtensionField,
  IDataExtensionListRecord,
  IDataExtensionRecordType,
  useDataExtensionFields,
  useDataExtensionRecordList,
  useDataExtensionRecordTypes,
} from 'ui-modules';
import { useDataExtensionPermissions } from '../hooks/useDataExtensionPermissions';
import { DataExtensionCustomRecordSheet } from './DataExtensionCustomRecordSheet';
import { DataExtensionObjectIcon } from './DataExtensionObjectIcon';

const PAGE_SIZE = 30;
/** Columns beyond these stay in the record sheet, so rows stay scannable. */
const MAX_FIELD_COLUMNS = 6;
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

type Sort = { field: string; direction: 1 | -1 };

const useDebounced = (value: string, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const SortableHead = ({
  label,
  field,
  sort,
  onSort,
  className,
}: {
  label: string;
  field?: string;
  sort: Sort;
  onSort: (sort: Sort) => void;
  className?: string;
}) => {
  const active = field && sort.field === field;
  const Icon = sort.direction === 1 ? IconSortAscending : IconSortDescending;

  if (!field) {
    return <Table.Head className={className}>{label}</Table.Head>;
  }

  return (
    <Table.Head
      className={className}
      aria-sort={
        active ? (sort.direction === 1 ? 'ascending' : 'descending') : 'none'
      }
    >
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-sm [font:inherit] [letter-spacing:inherit] [text-transform:inherit] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        onClick={() =>
          onSort({
            field,
            direction: active && sort.direction === 1 ? -1 : 1,
          })
        }
      >
        {label}
        {active && <Icon className="size-3.5" aria-hidden="true" />}
      </button>
    </Table.Head>
  );
};

/**
 * Records of a custom object: one request per page, search, sort by name,
 * date or any single-value field, and a sheet to open or add a record.
 */
export const DataExtensionRecordsTable = ({
  recordType,
}: {
  recordType: IDataExtensionRecordType;
}) => {
  const { t, i18n } = useTranslation('dataExtensions');
  const { canManageRecords } = useDataExtensionPermissions();
  const { fields } = useDataExtensionFields({
    recordType: recordType.recordType,
  });
  const { recordTypes } = useDataExtensionRecordTypes();
  const [search, setSearch] = useState('');
  const searchValue = useDebounced(search.trim());
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<Sort>({ field: 'createdAt', direction: -1 });
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const columns = useMemo(
    () => fields.filter((field) => field.type !== 'json').slice(0, MAX_FIELD_COLUMNS),
    [fields],
  );
  const { records, totalCount, loading, error, refetch } =
    useDataExtensionRecordList(recordType, fields, recordTypes, {
      searchValue: searchValue || undefined,
      limit: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      sortField: sort.field,
      sortDirection: sort.direction,
    });
  const singular = recordType.singularLabel || recordType.label;
  const pages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);

  useEffect(() => setPage(0), [searchValue, sort, recordType.recordType]);

  const onSort = (next: Sort) => setSort(next);
  const firstShown = totalCount ? page * PAGE_SIZE + 1 : 0;
  const lastShown = Math.min((page + 1) * PAGE_SIZE, totalCount);

  const renderBody = () => {
    if (loading && !records.length) {
      return Array.from({ length: 6 }, (_, index) => (
        <Table.Row key={index}>
          <Table.Cell colSpan={columns.length + 2}>
            <Skeleton className="h-5 w-full" />
          </Table.Cell>
        </Table.Row>
      ));
    }

    return records.map((record: IDataExtensionListRecord) => (
      <Table.Row
        key={record._id}
        tabIndex={0}
        className="cursor-pointer hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:outline-none"
        onClick={() => setOpenId(record._id)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            setOpenId(record._id);
          }
        }}
      >
        <Table.Cell className="max-w-64 truncate font-medium">
          {record.name}
        </Table.Cell>
        {columns.map((field) => (
          <Table.Cell key={field._id} className="max-w-56 overflow-hidden">
            <DataExtensionValueDisplay
              field={field}
              value={record.values[field.key] ?? null}
              links={record.links[field.key]}
              className="block max-w-full truncate"
            />
          </Table.Cell>
        ))}
        <Table.Cell className="whitespace-nowrap text-muted-foreground">
          {record.updatedAt
            ? new Date(record.updatedAt).toLocaleDateString(i18n.language)
            : '—'}
        </Table.Cell>
      </Table.Row>
    ));
  };

  const empty = !loading && !error && !records.length;

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <IconSearch
            aria-hidden="true"
            className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('records.search', { label: recordType.label })}
            aria-label={t('records.search', { label: recordType.label })}
            className="pl-8"
          />
        </div>
        <span className="text-sm tabular-nums text-muted-foreground">
          {t('records.count', { count: totalCount })}
        </span>
        {canManageRecords && (
          <Button className="ml-auto" onClick={() => setCreating(true)}>
            <IconPlus />
            {t('records.new', { label: singular })}
          </Button>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-md border border-dashed p-10 text-center"
        >
          <IconAlertCircle className="size-6 text-destructive" aria-hidden="true" />
          <p className="text-sm">{error.message}</p>
          <Button variant="outline" onClick={() => refetch()}>
            {t('retry')}
          </Button>
        </div>
      ) : empty ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed p-10 text-center">
          <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <DataExtensionObjectIcon icon={recordType.icon} className="size-5" />
          </span>
          <p className="text-sm font-medium">
            {searchValue
              ? t('records.no-results', { search: searchValue })
              : t('records.empty', { label: recordType.label })}
          </p>
          {!searchValue && (
            <p className="max-w-sm text-sm text-muted-foreground">
              {t('records.empty-hint', { label: singular })}
            </p>
          )}
          {!searchValue && canManageRecords && (
            <Button onClick={() => setCreating(true)}>
              <IconPlus />
              {t('records.new', { label: singular })}
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            'min-h-0 flex-auto overflow-auto rounded-md border transition-opacity',
            loading && 'opacity-70',
          )}
        >
          <Table>
            <Table.Header className="sticky top-0 z-10 bg-background">
              <Table.Row>
                <SortableHead
                  label={t('records.name')}
                  field="name"
                  sort={sort}
                  onSort={onSort}
                />
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
                    onSort={onSort}
                  />
                ))}
                <SortableHead
                  label={t('records.updated')}
                  field="updatedAt"
                  sort={sort}
                  onSort={onSort}
                />
              </Table.Row>
            </Table.Header>
            <Table.Body>{renderBody()}</Table.Body>
          </Table>
        </div>
      )}

      {totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
          <span className="tabular-nums">
            {t('records.range', {
              from: firstShown,
              to: lastShown,
              total: totalCount,
            })}
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

      <DataExtensionCustomRecordSheet
        recordType={recordType}
        recordId={openId}
        creating={creating}
        onClose={() => {
          // Values edited in place show in the list once the sheet closes.
          if (openId) {
            refetch();
          }

          setOpenId(null);
          setCreating(false);
        }}
        onChanged={() => refetch()}
        onCreated={(id) => {
          setCreating(false);
          setOpenId(id);
        }}
      />
    </div>
  );
};
