import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  Skeleton,
  Table,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useMemo } from 'react';
import { useFixedAssetCategories } from '../hooks/useFixedAssetCategories';
import { useFixedAssetCategoryRemove } from '../hooks/useFixedAssetMutations';
import { IFixedAssetCategory } from '../types/FixedAsset';

const FixedAssetCategoryMoreCell = ({
  cell,
}: {
  cell: Cell<IFixedAssetCategory, unknown>;
}) => {
  const [, setOpen] = useQueryState('fixedAssetCategoryId');
  const { confirm } = useConfirm();
  const { removeFixedAssetCategory } = useFixedAssetCategoryRemove();

  const handleDelete = () =>
    confirm({
      message: 'Үндсэн хөрөнгийн бүлгийг устгах уу?',
      options: {
        okLabel: 'Устгах',
        cancelLabel: 'Болих',
      },
    }).then(() => {
      removeFixedAssetCategory({
        variables: { _id: cell.row.original._id },
      });
    });

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => setOpen(cell.row.original._id)}
            >
              <IconEdit /> Засах
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> Устгах
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const fixedAssetCategoryColumns: ColumnDef<IFixedAssetCategory>[] = [
  {
    id: 'more',
    cell: FixedAssetCategoryMoreCell,
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<IFixedAssetCategory>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Код" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Нэр" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 240,
  },
  {
    id: 'depreciationMethod',
    accessorKey: 'depreciationMethod',
    header: () => <RecordTable.InlineHead label="Элэгдлийн арга" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 180,
  },
  {
    id: 'defaultUsefulLife',
    accessorKey: 'defaultUsefulLife',
    header: () => <RecordTable.InlineHead label="Хугацаа" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label="Тайлбар" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 300,
  },
];

const InitialSkeleton = ({ rows = 10 }: { rows?: number }) => {
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, () => crypto.randomUUID()),
    [rows],
  );

  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {fixedAssetCategoryColumns.map((column, index) => (
            <Table.Cell
              key={`${rowKey}-${column.id ?? index}`}
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

export const FixedAssetCategoriesTable = () => {
  const { fixedAssetCategories, loading } = useFixedAssetCategories();
  const isInitialLoading = loading && !fixedAssetCategories?.length;

  return (
    <RecordTable.Provider
      columns={fixedAssetCategoryColumns}
      data={isInitialLoading ? [] : fixedAssetCategories || []}
      stickyColumns={['more', 'checkbox', 'code']}
      className="m-3"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
          {isInitialLoading && <InitialSkeleton rows={10} />}
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Provider>
  );
};
