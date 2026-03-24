import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import {
  IconCode,
  IconTag,
  IconReceipt,
  IconPercentage,
} from '@tabler/icons-react';
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
    header: () => <RecordTable.InlineHead label="Title" icon={IconCode} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead label="Kind" icon={IconTag} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'taxType',
    accessorKey: 'taxType',
    header: () => (
      <RecordTable.InlineHead label="Tax Type" icon={IconReceipt} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'taxCode',
    accessorKey: 'taxCode',
    header: () => <RecordTable.InlineHead label="Tax Code" icon={IconCode} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },

  {
    id: 'taxPercent',
    accessorKey: 'taxPercent',
    header: () => (
      <RecordTable.InlineHead label="Percent" icon={IconPercentage} />
    ),
    cell: ({ cell }) => {
      const value = cell.getValue() as string | number | null | undefined;
      return (
        <RecordTableInlineCell>
          {value !== null && value !== undefined ? String(value) : ''}
        </RecordTableInlineCell>
      );
    },
  },
];
