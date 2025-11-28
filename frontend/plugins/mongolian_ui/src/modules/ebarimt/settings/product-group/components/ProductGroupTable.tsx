import { Cell, ColumnDef } from '@tanstack/react-table';
import { RecordTable, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
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
    header: () => <RecordTable.InlineHead label="Main Product" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
    size: 250,
  },
  {
    id: 'subProduct.name',
    accessorKey: 'subProduct.name',
    header: () => <RecordTable.InlineHead label="Sub Product" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
    size: 250,
  },
  {
    id: 'sortNum',
    accessorKey: 'sortNum',
    header: () => <RecordTable.InlineHead label="Sort Number" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
  },
  {
    id: 'ratio',
    accessorKey: 'ratio',
    header: () => <RecordTable.InlineHead label="Ratio" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: () => <RecordTable.InlineHead label="Is Active" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
  },
];

export const ProductGroupMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProductGroup, unknown>;
}) => {
  return <RecordTable.MoreButton />;
};

export const productGroupMoreColumn = {
  id: 'more',
  cell: ProductGroupMoreColumnCell,
  size: 33,
};
