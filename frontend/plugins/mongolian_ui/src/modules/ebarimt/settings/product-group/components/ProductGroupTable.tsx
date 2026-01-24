import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import {
  IconTag,
  IconPackage,
  IconSortAscending,
  IconPercentage,
  IconToggleLeft,
} from '@tabler/icons-react';
import { useProductGroupRows } from '@/ebarimt/settings/product-group/hooks/useProductGroupRows';
import { productGroupDetailAtom } from '@/ebarimt/settings/product-group/states/productGroupRowStates';
import { ProductGroupRowsCommandbar } from '@/ebarimt/settings/product-group/components/ProductGroupRowsCommandbar';
import { IProductGroup } from '@/ebarimt/settings/product-group/constants/productGroupDefaultValues';
import { useMemo } from 'react';

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
      </RecordTable.Scroll>
      <ProductGroupRowsCommandbar />
    </RecordTable.Provider>
  );
};
ProductGroupTable.displayName = 'ProductGroupTable';

export const ProductGroupRowMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProductGroup, unknown>;
}) => {
  const [, setOpen] = useQueryState('product_group_id');
  const setProductGroupDetail = useSetAtom(productGroupDetailAtom);
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setProductGroupDetail(cell.row.original);
        setOpen(cell.row.original._id);
      }}
    />
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
    id: 'mainProduct.name',
    accessorKey: 'mainProduct.name',
    header: () => (
      <RecordTable.InlineHead icon={IconPackage} label="Main Product" />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 250,
  },
  {
    id: 'subProduct.name',
    accessorKey: 'subProduct.name',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Sub Product" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
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
