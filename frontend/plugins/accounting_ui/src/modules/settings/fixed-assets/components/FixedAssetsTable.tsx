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
import { useFixedAssetRemove } from '../hooks/useFixedAssetMutations';
import { useFixedAssets } from '../hooks/useFixedAssets';
import { IFixedAsset, IFixedAssetCategory } from '../types/FixedAsset';

const FixedAssetMoreCell = ({ cell }: { cell: Cell<IFixedAsset, unknown> }) => {
  const [, setOpen] = useQueryState('fixedAssetId');
  const { confirm } = useConfirm();
  const { removeFixedAsset } = useFixedAssetRemove();

  const handleDelete = () =>
    confirm({
      message: 'Үндсэн хөрөнгийг устгах уу?',
      options: {
        okLabel: 'Устгах',
        cancelLabel: 'Болих',
      },
    }).then(() => {
      removeFixedAsset({
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

const CategoryCell = ({
  cell,
  categoriesById,
}: {
  cell: Cell<IFixedAsset, unknown>;
  categoriesById: Record<string, IFixedAssetCategory>;
}) => {
  const category = categoriesById[cell.row.original.categoryId];

  return (
    <RecordTableInlineCell>
      {category ? `${category.code} - ${category.name}` : ''}
    </RecordTableInlineCell>
  );
};

const getFixedAssetColumns = (
  categoriesById: Record<string, IFixedAssetCategory>,
): ColumnDef<IFixedAsset>[] => [
  {
    id: 'more',
    cell: FixedAssetMoreCell,
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<IFixedAsset>,
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
    id: 'categoryId',
    accessorKey: 'categoryId',
    header: () => <RecordTable.InlineHead label="Бүлэг" />,
    cell: ({ cell }) => (
      <CategoryCell cell={cell} categoriesById={categoriesById} />
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
    id: 'usefulLife',
    accessorKey: 'usefulLife',
    header: () => <RecordTable.InlineHead label="Хугацаа" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'salvageValue',
    accessorKey: 'salvageValue',
    header: () => <RecordTable.InlineHead label="Үлдэх өртөг" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 140,
  },
];

const InitialSkeleton = ({
  columns,
  rows = 10,
}: {
  columns: ColumnDef<IFixedAsset>[];
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
          {columns.map((column, index) => (
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

export const FixedAssetsTable = () => {
  const { fixedAssets, loading } = useFixedAssets();
  const { fixedAssetCategories } = useFixedAssetCategories();
  const categoriesById = useMemo(
    () =>
      fixedAssetCategories?.reduce(
        (acc: Record<string, IFixedAssetCategory>, category) => ({
          ...acc,
          [category._id]: category,
        }),
        {},
      ) || {},
    [fixedAssetCategories],
  );
  const columns = useMemo(
    () => getFixedAssetColumns(categoriesById),
    [categoriesById],
  );
  const isInitialLoading = loading && !fixedAssets?.length;

  return (
    <RecordTable.Provider
      columns={columns}
      data={isInitialLoading ? [] : fixedAssets || []}
      stickyColumns={['more', 'checkbox', 'code']}
      className="m-3"
    >
      <RecordTable>
        <RecordTable.Header />
        <RecordTable.Body>
          <RecordTable.RowList />
          {isInitialLoading && <InitialSkeleton columns={columns} rows={10} />}
        </RecordTable.Body>
      </RecordTable>
    </RecordTable.Provider>
  );
};
