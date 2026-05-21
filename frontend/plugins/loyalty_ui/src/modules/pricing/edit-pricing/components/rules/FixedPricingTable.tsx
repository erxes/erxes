import { useFieldArray, Control, useWatch } from 'react-hook-form';
import {
  Table,
  Checkbox,
  RecordTableHotkeyProvider,
  RecordTableHotKeyControl,
  RecordTableInlineCell,
  PopoverScoped,
  Form,
  InputNumber,
} from 'erxes-ui';
import { useRef, useEffect } from 'react';
import { GET_PRODUCTS_BY_IDS } from '~/modules/pricing/graphql/queries';
import { useQuery } from '@apollo/client';

interface IProductRow {
  _id: string;
  name: string;
  uom: string;
  unitPrice: number;
}
export const FixedPricingTable = ({
  control,
  pricingId,
  productIds,
  onSave,
}: {
  control: Control<any>;
  pricingId?: string;
  productIds: string[];
  onSave: () => void;
}) => {
  const { fields, replace } = useFieldArray({ control, name: 'fixedValues' });
  const tableRef = useRef<HTMLTableElement>(null);

  const { data, loading } = useQuery(GET_PRODUCTS_BY_IDS, {
    variables: { ids: productIds },
    skip: !productIds.length,
  });
  const products: IProductRow[] = data?.productsMain?.list || [];

  const currentFixedValues = useWatch({
    control,
    name: 'fixedValues',
  }) as any[];

  useEffect(() => {
    if (!products.length) return;

    const rows = products.map((product) => {
      const existing = currentFixedValues?.find(
        (fv: any) => fv.productId === product._id,
      );
      return {
        productId: product._id,
        uom: product.uom || '',
        unitPrice: product.unitPrice || 0,
        newPrice: existing?.newPrice ?? product.unitPrice ?? 0,
      };
    });

    replace(rows);
  }, [products]);

  if (loading) return <div>Loading products...</div>;
  if (!productIds.length) return <div>No products selected on this plan.</div>;

  return (
    <RecordTableHotkeyProvider
      columnLength={1}
      rowLength={fields.length}
      scope="pricingFixedValues"
    >
      <Table ref={tableRef}>
        <Table.Header>
          <Table.Row>
            <Table.Head />
            <Table.Head>Product</Table.Head>
            <Table.Head>UOM</Table.Head>
            <Table.Head>Unit Price</Table.Head>
            <Table.Head>New Price</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {fields.map((field, index) => (
            <FixedPricingRow
              key={field.id}
              rowId={field.id}
              index={index}
              control={control}
              product={products[index]}
              onSave={onSave}
            />
          ))}
        </Table.Body>
      </Table>
    </RecordTableHotkeyProvider>
  );
};

const FixedPricingRow = ({
  rowId,
  index,
  control,
  product,
  onSave,
}: {
  rowId: string;
  index: number;
  control: Control<any>;
  product: IProductRow;
  onSave: () => void;
}) => {
  return (
    <Table.Row>
      <Table.Cell>
        <RecordTableInlineCell className="justify-center">
          <Checkbox />
        </RecordTableInlineCell>
      </Table.Cell>

      <Table.Cell>
        <RecordTableInlineCell>{product?.name}</RecordTableInlineCell>
      </Table.Cell>

      <Table.Cell>
        <Form.Field
          control={control}
          name={`fixedValues.${index}.uom`}
          render={({ field }) => (
            <RecordTableInlineCell>{field.value}</RecordTableInlineCell>
          )}
        />
      </Table.Cell>

      <Table.Cell>
        <Form.Field
          control={control}
          name={`fixedValues.${index}.unitPrice`}
          render={({ field }) => (
            <RecordTableInlineCell>
              {field.value?.toLocaleString() || 0}
            </RecordTableInlineCell>
          )}
        />
      </Table.Cell>

      <RecordTableHotKeyControl rowId={rowId} rowIndex={index}>
        <Table.Cell>
          <Form.Field
            control={control}
            name={`fixedValues.${index}.newPrice`}
            render={({ field }) => (
              <PopoverScoped
                scope={`fixedValues.${index}.newPrice`}
                closeOnEnter
              >
                <Form.Control>
                  <RecordTableInlineCell.Trigger>
                    {field.value?.toLocaleString() || 0}
                  </RecordTableInlineCell.Trigger>
                </Form.Control>
                <RecordTableInlineCell.Content>
                  <InputNumber
                    value={field.value ?? 0}
                    onChange={(v) => field.onChange(v || 0)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onSave();
                      }
                    }}
                  />
                </RecordTableInlineCell.Content>
              </PopoverScoped>
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>
    </Table.Row>
  );
};
