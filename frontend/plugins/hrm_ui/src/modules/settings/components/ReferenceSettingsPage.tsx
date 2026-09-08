import { useMutation, useQuery } from '@apollo/client';
import { ColumnDef } from '@tanstack/react-table';
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Command,
  CommandBar,
  Combobox,
  Input,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  Separator,
  Skeleton,
  Spinner,
  Table,
  toast,
  useConfirm,
} from 'erxes-ui';
import { useCallback, useMemo, useState } from 'react';
import { HrmSettingsLayout } from './HrmSettingsLayout';
import { ReferenceFormSheet } from './ReferenceFormSheet';
import {
  HrmReferenceRecord,
  ReferenceConfig,
  ReferenceFormValues,
} from '../types/settings';

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Үйлдэл амжилтгүй боллоо';

const getRecordSummary = (record: HrmReferenceRecord, kind: string) => {
  if (kind === 'contributionProfiles') {
    return `${record.employeeRate || 0}% / ${record.employerRate || 0}%`;
  }

  if (kind === 'grades') {
    return [
      record.rank !== undefined ? `rank ${record.rank}` : '',
      record.baseSalary ? `цалин ${record.baseSalary}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }

  if (kind === 'seniorityRules') {
    const first = record.brackets?.[0];
    return first
      ? `${first.minMonths}-${first.maxMonths || '∞'} сар: ${first.value}`
      : record.valueType || '';
  }

  if (kind === 'skills') {
    return [
      record.category,
      record.score !== undefined ? `${record.score} оноо` : '',
    ]
      .filter(Boolean)
      .join(' · ');
  }

  return '';
};

const ReferenceInitialSkeleton = ({
  columns,
  rows = 20,
}: {
  columns: ColumnDef<HrmReferenceRecord>[];
  rows?: number;
}) => {
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, () => crypto.randomUUID()),
    [rows],
  );

  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {columns.map((column, columnIndex) => (
            <Table.Cell
              key={`${rowKey}-${column.id ?? columnIndex}`}
              className="border-r-0 px-2"
            >
              <Skeleton className="h-4 w-full min-w-4" />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
};

const ReferenceCommandBar = ({
  loading,
  onArchive,
}: {
  loading: boolean;
  onArchive: (records: HrmReferenceRecord[]) => void;
}) => {
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {selectedRows.length} сонгосон
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          variant="secondary"
          disabled={loading}
          onClick={() => onArchive(selectedRows.map((row) => row.original))}
        >
          <IconTrash />
          Архивлах
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};

export const ReferenceSettingsPage = ({
  config,
}: {
  config: ReferenceConfig;
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [activeRecord, setActiveRecord] = useState<HrmReferenceRecord | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const { confirm } = useConfirm();

  const variables = useMemo(
    () => ({
      status: 'active',
      searchValue: searchValue || undefined,
      page: 1,
      perPage: 50,
    }),
    [searchValue],
  );

  const { data, loading, refetch } = useQuery<
    Record<string, HrmReferenceRecord[]>
  >(config.listQuery, { variables });
  const { data: countData, refetch: refetchCount } = useQuery<
    Record<string, number>
  >(config.countQuery, { variables });

  const [createRecord, createState] = useMutation(config.createMutation);
  const [updateRecord, updateState] = useMutation(config.updateMutation);
  const [archiveRecord, archiveState] = useMutation(config.archiveMutation);

  const records = data?.[config.listField] || [];
  const totalCount = countData?.[config.countField] || 0;
  const submitting =
    createState.loading || updateState.loading || archiveState.loading;
  const isInitialLoading = loading && records.length === 0;

  const refresh = useCallback(async () => {
    await Promise.all([refetch(), refetchCount()]);
  }, [refetch, refetchCount]);

  const openCreate = () => {
    setActiveRecord(null);
    setSheetOpen(true);
  };

  const openEdit = useCallback((record: HrmReferenceRecord) => {
    setActiveRecord(record);
    setSheetOpen(true);
  }, []);

  const handleSubmit = async (values: ReferenceFormValues) => {
    try {
      if (activeRecord) {
        await updateRecord({
          variables: { _id: activeRecord._id, doc: config.buildDoc(values) },
        });
        toast({ title: 'Амжилттай', description: 'Бүртгэл шинэчлэгдлээ' });
      } else {
        await createRecord({ variables: { doc: config.buildDoc(values) } });
        toast({ title: 'Амжилттай', description: 'Бүртгэл нэмэгдлээ' });
      }

      setSheetOpen(false);
      await refresh();
    } catch (error) {
      toast({ title: 'Алдаа', description: getErrorMessage(error) });
    }
  };

  const archiveRecords = useCallback(
    async (recordsToArchive: HrmReferenceRecord[]) => {
      try {
        await Promise.all(
          recordsToArchive.map((record) =>
            archiveRecord({ variables: { _id: record._id } }),
          ),
        );
        toast({ title: 'Амжилттай', description: 'Бүртгэл архивлагдлаа' });
        await refresh();
      } catch (error) {
        toast({ title: 'Алдаа', description: getErrorMessage(error) });
      }
    },
    [archiveRecord, refresh],
  );

  const handleArchive = useCallback(
    (recordsToArchive: HrmReferenceRecord[]) => {
      confirm({
        message: 'Сонгосон бүртгэлийг архивлахдаа итгэлтэй байна уу?',
        options: {
          okLabel: 'Архивлах',
          cancelLabel: 'Болих',
        },
      }).then(() => archiveRecords(recordsToArchive));
    },
    [confirm, archiveRecords],
  );

  const columns = useMemo<ColumnDef<HrmReferenceRecord>[]>(
    () => [
      {
        id: 'more',
        header: () => <RecordTable.ColumnSelector />,
        cell: ({ row }) => (
          <Popover>
            <Popover.Trigger asChild>
              <RecordTable.MoreButton className="h-full w-full" />
            </Popover.Trigger>
            <Combobox.Content>
              <Command shouldFilter={false}>
                <Command.List>
                  <Command.Item
                    value="edit"
                    onSelect={() => openEdit(row.original)}
                  >
                    <IconEdit />
                    Засах
                  </Command.Item>
                  <Command.Item
                    value="archive"
                    onSelect={() => handleArchive([row.original])}
                  >
                    <IconTrash />
                    Архивлах
                  </Command.Item>
                </Command.List>
              </Command>
            </Combobox.Content>
          </Popover>
        ),
        size: 33,
      },
      RecordTable.checkboxColumn as ColumnDef<HrmReferenceRecord>,
      {
        id: 'code',
        accessorKey: 'code',
        header: () => <RecordTable.InlineHead label="Код" />,
        cell: ({ cell }) => (
          <RecordTableInlineCell className="font-mono">
            {cell.getValue<string>()}
          </RecordTableInlineCell>
        ),
        size: 160,
      },
      {
        id: 'name',
        accessorKey: 'name',
        header: () => <RecordTable.InlineHead label="Нэр" />,
        cell: ({ row }) => (
          <RecordTableInlineCell className="flex-col items-start justify-center">
            <span className="font-medium">{row.original.name}</span>
            {row.original.description && (
              <span className="max-w-full truncate text-xs text-muted-foreground">
                {row.original.description}
              </span>
            )}
          </RecordTableInlineCell>
        ),
        size: 320,
      },
      {
        id: 'summary',
        header: () => <RecordTable.InlineHead label="Үзүүлэлт" />,
        cell: ({ row }) => (
          <RecordTableInlineCell>
            {getRecordSummary(row.original, config.kind) || '-'}
          </RecordTableInlineCell>
        ),
        size: 220,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: () => <RecordTable.InlineHead label="Төлөв" />,
        cell: ({ cell }) => (
          <RecordTableInlineCell>
            {cell.getValue<string>()}
          </RecordTableInlineCell>
        ),
        size: 120,
      },
    ],
    [config.kind, handleArchive, openEdit],
  );

  return (
    <HrmSettingsLayout
      actions={
        <Button onClick={openCreate}>
          <IconPlus size={16} />
          {config.createLabel}
        </Button>
      }
    >
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{config.title}</h2>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            Нийт: {totalCount}
          </div>
        </div>

        <div className="relative max-w-md">
          <IconSearch
            size={16}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            className="pl-8"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Хайх"
          />
        </div>

        <RecordTable.Provider
          columns={columns}
          data={isInitialLoading ? [] : records}
          stickyColumns={['more', 'checkbox', 'code']}
          tableId={`hrm_${config.kind}_record_table`}
        >
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {isInitialLoading && (
                <ReferenceInitialSkeleton columns={columns} rows={20} />
              )}
              {!loading && records.length === 0 && (
                <Table.Row>
                  <Table.Cell colSpan={columns.length}>
                    <div className="flex min-h-56 items-center justify-center">
                      <div className="max-w-sm text-center">
                        <h3 className="font-semibold">{config.emptyTitle}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {config.emptyDescription}
                        </p>
                        <Button className="mt-4" onClick={openCreate}>
                          <IconPlus size={16} />
                          {config.createLabel}
                        </Button>
                      </div>
                    </div>
                  </Table.Cell>
                </Table.Row>
              )}
            </RecordTable.Body>
          </RecordTable>
          {loading && records.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Spinner size="sm" />
              Уншиж байна
            </div>
          )}
          <ReferenceCommandBar loading={submitting} onArchive={handleArchive} />
        </RecordTable.Provider>
      </div>

      <ReferenceFormSheet
        config={config}
        record={activeRecord}
        open={sheetOpen}
        submitting={submitting}
        onOpenChange={setSheetOpen}
        onSubmit={handleSubmit}
      />
    </HrmSettingsLayout>
  );
};
