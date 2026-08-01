import { IconEdit, IconTrash } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Button,
  CommandBar,
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  Separator,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import {
  SettingsRowsTable,
  moreColumn,
} from '~/modules/settings/components/SettingsRowsTable';
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
    ...moreColumn,
    cell: FixedAssetCategoryMoreCell,
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

const FixedAssetCategoriesCommandbar = () => {
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length} сонгосон
        </CommandBar.Value>
        <Separator.Inline />
        <FixedAssetCategoriesDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const FixedAssetCategoriesDelete = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeFixedAssetCategory, loading } = useFixedAssetCategoryRemove();

  const handleDelete = () =>
    confirm({
      message: 'Эдгээр үндсэн хөрөнгийн бүлгийг устгах уу?',
      options: {
        okLabel: 'Устгах',
        cancelLabel: 'Болих',
      },
    }).then(() => {
      table.getFilteredSelectedRowModel().rows.forEach((row) => {
        removeFixedAssetCategory({
          variables: { _id: row.original._id },
          onCompleted: () => table.setRowSelection({}),
        });
      });
    });

  return (
    <Button variant="secondary" disabled={loading} onClick={handleDelete}>
      <IconTrash />
      Устгах
    </Button>
  );
};

export const FixedAssetCategoriesTable = () => {
  const { fixedAssetCategories, loading } = useFixedAssetCategories();

  return (
    <SettingsRowsTable
      columns={fixedAssetCategoryColumns}
      data={fixedAssetCategories || []}
      loading={loading}
      stickyColumns={['more', 'checkbox', 'code']}
      className="m-3"
      Commandbar={FixedAssetCategoriesCommandbar}
    />
  );
};
