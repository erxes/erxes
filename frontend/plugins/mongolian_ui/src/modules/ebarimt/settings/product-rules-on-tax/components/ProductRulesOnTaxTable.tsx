import { Cell, ColumnDef } from '@tanstack/react-table';
import { RecordTable, useQueryState } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { IProductRulesOnTax } from '@/ebarimt/settings/product-rules-on-tax/constants/productRulesOnTaxDefaultValues';
import { ProductRulesOnTaxRowsCommandbar } from './ProductRulesOnTaxRowsCommandbar';
import { productRulesOnTaxDetailAtom } from '@/ebarimt/settings/product-rules-on-tax/states/productRulesOnTaxRowStates';
import { useProductRulesOnTaxRows } from '@/ebarimt/settings/product-rules-on-tax/hooks/useProductRulesOnTaxRows';

export const ProductRulesOnTaxTable = () => {
  const { productRulesOnTaxRows, loading, handleFetchMore, totalCount } =
    useProductRulesOnTaxRows();

  return (
    <RecordTable.Provider
      columns={productRulesOnTaxColumns}
      data={productRulesOnTaxRows || []}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {!loading &&
              (totalCount ?? 0) > (productRulesOnTaxRows?.length ?? 0) && (
                <RecordTable.RowSkeleton
                  rows={40}
                  handleInView={handleFetchMore}
                />
              )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      <ProductRulesOnTaxRowsCommandbar />
    </RecordTable.Provider>
  );
};

export const ProductRulesOnTaxRowMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProductRulesOnTax, unknown>;
}) => {
  const [, setOpen] = useQueryState('product_rules_on_tax_id');
  const setProductRulesOnTaxDetail = useSetAtom(productRulesOnTaxDetailAtom);
  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setProductRulesOnTaxDetail(cell.row.original);
        setOpen(cell.row.original._id);
      }}
    />
  );
};

export const productRulesOnTaxRowMoreColumn = {
  id: 'more',
  cell: ProductRulesOnTaxRowMoreColumnCell,
  size: 33,
};

export const productRulesOnTaxColumns: ColumnDef<IProductRulesOnTax>[] = [
  productRulesOnTaxRowMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IProductRulesOnTax>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead label="Title" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
    size: 250,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead label="Kind" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
    size: 100,
  },
  {
    id: 'taxType',
    accessorKey: 'taxType',
    header: () => <RecordTable.InlineHead label="Tax Type" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
  },
  {
    id: 'taxCode',
    accessorKey: 'taxCode',
    header: () => <RecordTable.InlineHead label="Tax Code" />,
    cell: ({ cell }) => {
      return <div>{cell.getValue() as string}</div>;
    },
    size: 250,
  },

  {
    id: 'taxPercent',
    accessorKey: 'taxPercent',
    header: () => <RecordTable.InlineHead label="Percent" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string | number | null | undefined;
      return (
        <div>{value !== null && value !== undefined ? String(value) : ''}</div>
      );
    },
  },
];

export const ProductRulesOnTaxMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProductRulesOnTax, unknown>;
}) => {
  return <RecordTable.MoreButton />;
};

export const productRulesOnTaxMoreColumn = {
  id: 'more',
  cell: ProductRulesOnTaxMoreColumnCell,
  size: 33,
};
