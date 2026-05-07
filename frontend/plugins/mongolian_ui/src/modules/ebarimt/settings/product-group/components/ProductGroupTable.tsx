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
} from 'erxes-ui';
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
import { useMemo } from 'react';
import { AddProductGroup } from './ProductGroup';
import { useProducts } from '@/ebarimt/settings/product-group/hooks/useProducts';
import { useProductGroupRowsRemove } from '@/ebarimt/settings/product-group/hooks/useProductGroupRowsRemove';

export const ProductGroupTable = () => {
  const { productGroupRows, loading, handleFetchMore, totalCount } =
    useProductGroupRows();
  const memoizedColumns = useMemo(() => productGroupsColumns, []);
  return (
    <RecordTable.Provider
      columns={memoizedColumns}
      data={productGroupRows || []}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={4} />}
            {!loading &&
              (totalCount ?? 0) > (productGroupRows?.length ?? 0) && (
                <RecordTable.RowSkeleton
                  rows={4}
                  handleInView={handleFetchMore}
                />
              )}
          </RecordTable.Body>
        </RecordTable>
        {!loading && productGroupRows?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <IconClipboardList size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                No Product Group config yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Get started by creating your first Product Group config.
              </p>
              <AddProductGroup />
            </div>
          </div>
        )}
      </RecordTable.Scroll>
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
  const { productsById } = useProducts();
  const row = cell.row.original;
  const name = productsById[row.mainProductId]?.name ?? '';
  return (
    <RecordTableInlineCell
      className="cursor-pointer"
      onClick={() => {
        setDetail(row);
        setOpen(row._id);
      }}
    >
      <TextOverflowTooltip value={name} />
    </RecordTableInlineCell>
  );
};

export const ProductGroupSubProductCell = ({
  cell,
}: {
  cell: Cell<IProductGroup, unknown>;
}) => {
  const { productsById } = useProducts();
  const row = cell.row.original;
  const name = productsById[row.subProductId]?.name ?? '';
  return (
    <RecordTableInlineCell>
      <TextOverflowTooltip value={name} />
    </RecordTableInlineCell>
  );
};

export const ProductGroupRowMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProductGroup, unknown>;
}) => {
  const [, setOpen] = useQueryState('product_group_id');
  const setProductGroupDetail = useSetAtom(productGroupDetailAtom);
  const { removeProductGroup } = useProductGroupRowsRemove();
  const { confirm } = useConfirm();

  const handleEdit = () => {
    setProductGroupDetail(cell.row.original);
    setOpen(cell.row.original._id);
  };

  const handleDelete = () => {
    confirm({
      message: 'Are you sure you want to delete this product group?',
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(() => removeProductGroup({ variables: { ids: [cell.row.original._id] } }));
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
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item value="delete" onSelect={handleDelete}>
              <IconTrash /> Delete
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
ProductGroupRowMoreColumnCell.displayName = 'ProductGroupRowMoreColumnCell';

export const productGroupRowMoreColumn = {
  id: 'more',
  cell: ProductGroupRowMoreColumnCell,
  size: 33,
};

export const productGroupsColumns: ColumnDef<IProductGroup>[] = [
  productGroupRowMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IProductGroup>,
  {
    id: 'mainProductId',
    accessorKey: 'mainProductId',
    header: () => (
      <RecordTable.InlineHead icon={IconPackage} label="Main Product" />
    ),
    cell: ({ cell }) => <ProductGroupMainProductCell cell={cell} />,
    size: 250,
  },
  {
    id: 'subProductId',
    accessorKey: 'subProductId',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Sub Product" />,
    cell: ({ cell }) => <ProductGroupSubProductCell cell={cell} />,
    size: 250,
  },
  {
    id: 'sortNum',
    accessorKey: 'sortNum',
    header: () => (
      <RecordTable.InlineHead icon={IconSortAscending} label="Sort Number" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'ratio',
    accessorKey: 'ratio',
    header: () => (
      <RecordTable.InlineHead icon={IconPercentage} label="Ratio" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: () => (
      <RecordTable.InlineHead icon={IconToggleLeft} label="Is Active" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() ? 'Active' : 'Inactive'} />
      </RecordTableInlineCell>
    ),
  },
];
