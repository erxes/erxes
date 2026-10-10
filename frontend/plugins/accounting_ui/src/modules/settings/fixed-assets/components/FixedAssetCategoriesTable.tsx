import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState('fixedAssetCategoryId');
  const { confirm } = useConfirm();
  const { removeFixedAssetCategory } = useFixedAssetCategoryRemove();

  const handleDelete = () =>
    confirm({
      message: t('delete-this-fixed-asset-category'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel-label'),
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
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const fixedAssetCategoryColumns = (
  t: TFunction<'accounting'>,
): ColumnDef<IFixedAssetCategory>[] => [
  {
    ...moreColumn,
    cell: FixedAssetCategoryMoreCell,
  },
  RecordTable.checkboxColumn as ColumnDef<IFixedAssetCategory>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label={t('code')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 140,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 240,
  },
  {
    id: 'depreciationMethod',
    accessorKey: 'depreciationMethod',
    header: () => <RecordTable.InlineHead label={t('depreciation-method')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 180,
  },
  {
    id: 'defaultAnnualDepreciationRate',
    accessorKey: 'defaultAnnualDepreciationRate',
    header: () => <RecordTable.InlineHead label={t('annual-rate')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label={t('description')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 300,
  },
];

const FixedAssetCategoriesCommandbar = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {table.getFilteredSelectedRowModel().rows.length}{' '}
          {t('selected-label-4')}
        </CommandBar.Value>
        <Separator.Inline />
        <FixedAssetCategoriesDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const FixedAssetCategoriesDelete = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeFixedAssetCategory, loading } = useFixedAssetCategoryRemove();

  const handleDelete = () =>
    confirm({
      message: t('delete-these-fixed-asset-categories'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel-label'),
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
      {t('delete')}
    </Button>
  );
};

export const FixedAssetCategoriesTable = () => {
  const { t } = useTranslation('accounting');
  const { fixedAssetCategories, loading } = useFixedAssetCategories();

  return (
    <SettingsRowsTable
      columns={fixedAssetCategoryColumns(t)}
      data={fixedAssetCategories || []}
      loading={loading}
      stickyColumns={['more', 'checkbox', 'code']}
      className="m-3"
      Commandbar={FixedAssetCategoriesCommandbar}
      tableId="accounting_fixed_asset_categories_record_table"
    />
  );
};
