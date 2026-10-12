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
import { useMemo } from 'react';
import {
  SettingsRowsTable,
  moreColumn,
} from '~/modules/settings/components/SettingsRowsTable';
import { useFixedAssetCategories } from '../hooks/useFixedAssetCategories';
import { useFixedAssetRemove } from '../hooks/useFixedAssetMutations';
import { useFixedAssets } from '../hooks/useFixedAssets';
import { IFixedAsset, IFixedAssetCategory } from '../types/FixedAsset';

const FixedAssetMoreCell = ({ cell }: { cell: Cell<IFixedAsset, unknown> }) => {
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState('fixedAssetId');
  const { confirm } = useConfirm();
  const { removeFixedAsset } = useFixedAssetRemove();

  const handleDelete = () =>
    confirm({
      message: t('delete-this-fixed-asset'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel-label'),
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
  t: TFunction<'accounting'>,
): ColumnDef<IFixedAsset>[] => [
  {
    ...moreColumn,
    cell: FixedAssetMoreCell,
  },
  RecordTable.checkboxColumn as ColumnDef<IFixedAsset>,
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
    id: 'categoryId',
    accessorKey: 'categoryId',
    header: () => <RecordTable.InlineHead label={t('category-label')} />,
    cell: ({ cell }) => (
      <CategoryCell cell={cell} categoriesById={categoriesById} />
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
    id: 'annualDepreciationRate',
    accessorKey: 'annualDepreciationRate',
    header: () => <RecordTable.InlineHead label={t('annual-rate')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'salvageValue',
    accessorKey: 'salvageValue',
    header: () => <RecordTable.InlineHead label={t('residual-value')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 140,
  },
];

const FixedAssetsCommandbar = () => {
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
        <FixedAssetsDelete />
      </CommandBar.Bar>
    </CommandBar>
  );
};

const FixedAssetsDelete = () => {
  const { t } = useTranslation('accounting');
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { removeFixedAsset, loading } = useFixedAssetRemove();

  const handleDelete = () =>
    confirm({
      message: t('delete-these-fixed-assets'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel-label'),
      },
    }).then(() => {
      table.getFilteredSelectedRowModel().rows.forEach((row) => {
        removeFixedAsset({
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

export const FixedAssetsTable = () => {
  const { t } = useTranslation('accounting');
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
    () => getFixedAssetColumns(categoriesById, t),
    [categoriesById, t],
  );

  return (
    <SettingsRowsTable
      columns={columns}
      data={fixedAssets || []}
      loading={loading}
      stickyColumns={['more', 'checkbox', 'code']}
      className="m-3"
      Commandbar={FixedAssetsCommandbar}
      tableId="accounting_fixed_assets_record_table"
      showColumnSelector
    />
  );
};
