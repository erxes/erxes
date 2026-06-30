import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useConfirm,
  useQueryState,
  Popover,
  Combobox,
  Command,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import {
  IconEdit,
  IconTag,
  IconPackage,
  IconSortAscending,
  IconPercentage,
  IconToggleLeft,
  IconClipboardList,
  IconTrash,
} from '@tabler/icons-react';
import { useProductGroupRows } from '@/ebarimt/settings/product-group/hooks/useProductGroupRows';
import { productGroupDetailAtom } from '@/ebarimt/settings/product-group/states/productGroupRowStates';
import { ProductGroupRowsCommandbar } from '@/ebarimt/settings/product-group/components/ProductGroupRowsCommandbar';
import { IProductGroup } from '@/ebarimt/settings/product-group/constants/productGroupDefaultValues';
import { PRODUCT_GROUP_CURSOR_SESSION_KEY } from '@/ebarimt/settings/product-group/constants/productGroupRowDefaultVariables';
import { useMemo } from 'react';
import { AddProductGroup } from './ProductGroup';
import { useProductGroupRowsRemove } from '@/ebarimt/settings/product-group/hooks/useProductGroupRowsRemove';

const ProductGroupEmptyState = () => {
  const { t } = useTranslation('mongolian');
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center text-center">
        <IconClipboardList size={48} className="text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">
          {t('no-product-group-config-yet')}
        </h3>
        <p className="mt-1 text-sm text-gray-500 mb-4">
          {t('create-first-product-group-config')}
        </p>
        <AddProductGroup />
      </div>
    </div>
  );
};

export const ProductGroupTable = () => {
  const { productGroupRows, loading, handleFetchMore, totalCount, pageInfo } =
    useProductGroupRows();
  const columns = useProductGroupsColumns();
  const memoizedColumns = useMemo(() => columns, [columns]);

  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const isInitialLoading = loading && productGroupRows.length === 0;

  return (
    <RecordTable.Provider columns={memoizedColumns} data={productGroupRows}>
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={productGroupRows.length}
        sessionKey={PRODUCT_GROUP_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        {isInitialLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
        {!loading && totalCount === 0 && (
          <ProductGroupEmptyState />
        )}
      </RecordTable.CursorProvider>
      <ProductGroupRowsCommandbar />
    </RecordTable.Provider>
  );
};
ProductGroupTable.displayName = 'ProductGroupTable';

export const ProductGroupMainProductCell = ({
  cell,
}: {
  cell: Cell<IProductGroup, unknown>;
}) => {
  const [, setOpen] = useQueryState('product_group_id');
  const setDetail = useSetAtom(productGroupDetailAtom);
  const row = cell.row.original;
  const productInfo = [row.mainProduct?.code, row.mainProduct?.name]
    .filter(Boolean)
    .join(' - ');

  return (
    <RecordTableInlineCell
      className="cursor-pointer"
      onClick={() => {
        setDetail(row);
        setOpen(row._id ?? null);
      }}
    >
      <TextOverflowTooltip value={productInfo} />
    </RecordTableInlineCell>
  );
};

export const ProductGroupSubProductCell = ({
  cell,
}: {
  cell: Cell<IProductGroup, unknown>;
}) => {
  const row = cell.row.original;
  const productInfo = [row.subProduct?.code, row.subProduct?.name]
    .filter(Boolean)
    .join(' - ');

  return (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={productInfo} />
    </RecordTableInlineCell>
  );
};

export const ProductGroupRowMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProductGroup, unknown>;
}) => {
  const { t } = useTranslation('mongolian');
  const [, setOpen] = useQueryState('product_group_id');
  const setProductGroupDetail = useSetAtom(productGroupDetailAtom);
  const { removeProductGroup } = useProductGroupRowsRemove();
  const { confirm } = useConfirm();

  const handleEdit = () => {
    setProductGroupDetail(cell.row.original);
    setOpen(cell.row.original._id ?? null);
  };

  const handleDelete = () => {
    confirm({
      message: t('delete-product-group-confirm'),
      options: { okLabel: t('delete'), cancelLabel: t('cancel') },
    }).then(() =>
      removeProductGroup({ variables: { ids: [cell.row.original._id] } }),
    );
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={handleEdit}>
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
ProductGroupRowMoreColumnCell.displayName = 'ProductGroupRowMoreColumnCell';

const productGroupRowMoreColumn: ColumnDef<IProductGroup> = {
  id: 'more',
  cell: ({ cell }) => <ProductGroupRowMoreColumnCell cell={cell} />,
  size: 33,
};

export const useProductGroupsColumns = (): ColumnDef<IProductGroup>[] => {
  const { t } = useTranslation('mongolian');
  return [
    productGroupRowMoreColumn,
    RecordTable.checkboxColumn as ColumnDef<IProductGroup>,
    {
      id: 'mainProductId',
      accessorKey: 'mainProductId',
      header: () => (
        <RecordTable.InlineHead icon={IconPackage} label={t('main-product')} />
      ),
      cell: ({ cell }) => <ProductGroupMainProductCell cell={cell} />,
      size: 250,
    },
    {
      id: 'subProductId',
      accessorKey: 'subProductId',
      header: () => <RecordTable.InlineHead icon={IconTag} label={t('sub-product')} />,
      cell: ({ cell }) => <ProductGroupSubProductCell cell={cell} />,
      size: 250,
    },
    {
      id: 'sortNum',
      accessorKey: 'sortNum',
      header: () => (
        <RecordTable.InlineHead icon={IconSortAscending} label={t('sort-number')} />
      ),
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'ratio',
      accessorKey: 'ratio',
      header: () => (
        <RecordTable.InlineHead icon={IconPercentage} label={t('ratio')} />
      ),
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={String(cell.getValue() ?? '')} />
        </RecordTableInlineCell>
      ),
    },
    {
      id: 'isActive',
      accessorKey: 'isActive',
      header: () => (
        <RecordTable.InlineHead icon={IconToggleLeft} label={t('is-active')} />
      ),
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() ? t('active') : t('inactive')} />
        </RecordTableInlineCell>
      ),
    },
  ];
};

export const productGroupsColumns: ColumnDef<IProductGroup>[] = [];
