import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface SettingsRowsTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  loading: boolean;
  totalCount?: number;
  handleFetchMore?: () => void;
  Commandbar: React.ComponentType;
}

/** RecordTable-g heregleed settings rows table hiih */
export const SettingsRowsTable = <TData,>({
  columns,
  data,
  loading,
  totalCount,
  handleFetchMore,
  Commandbar,
}: SettingsRowsTableProps<TData>) => {
  const isInitialLoading = loading && !data?.length;

  return (
    <RecordTable.Provider
      columns={columns}
      data={isInitialLoading ? [] : data || []}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {isInitialLoading && <RecordTable.RowSkeleton rows={20} />}
            {!loading && (totalCount ?? 0) > (data?.length ?? 0) && (
              <RecordTable.RowSkeleton
                rows={4}
                handleInView={handleFetchMore}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <Commandbar />
    </RecordTable.Provider>
  );
};

/** tax/vat/ctax row iin shared column definitions avah */
export const getSharedRowColumns = <T,>(
  moreColumn: ColumnDef<T>,
): ColumnDef<T>[] => [
  moreColumn,
  RecordTable.checkboxColumn as ColumnDef<T>,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead label="Дугаар" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 250,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Нэр" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 250,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead label="Төрөл" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Төлөв" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'percent',
    accessorKey: 'percent',
    header: () => <RecordTable.InlineHead label="Хувь" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
];

/** shared more actions cell with edit/delete popover. */
export const MoreActionsCell = <T,>({
  cell,
  onEdit,
  onDelete,
}: {
  cell: Cell<T, unknown>;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { t } = useTranslation('accounting');

  const actionsMenu = (
    <Combobox.Content>
      <Command shouldFilter={false}>
        <Command.List>
          <Command.Item value="edit" onSelect={onEdit}>
            <IconEdit /> {t('edit')}
          </Command.Item>
          <Command.Item value="delete" onSelect={onDelete}>
            <IconTrash /> {t('delete')}
          </Command.Item>
        </Command.List>
      </Command>
    </Combobox.Content>
  );

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      {actionsMenu}
    </Popover>
  );
};

/** shared more column definition. */
export const moreColumn = {
  id: 'more',
  size: 33,
};
