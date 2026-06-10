import { useFieldArray, Control } from 'react-hook-form';
import {
  Table,
  Checkbox,
  RecordTableHotkeyProvider,
  RecordTableHotKeyControl,
  RecordTableInlineCell,
  PopoverScoped,
  Form,
  InputNumber,
  Input,
  Select,
} from 'erxes-ui';
import { useRef, useEffect, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';
import { IPricingPlanDetail } from '@/pricing/types';
import { GET_PRODUCTS_BY_IDS } from '~/modules/pricing/graphql/queries';
import { useQuery } from '@apollo/client';

interface IProductRow {
  _id: string;
  name: string;
  uom: string;
  unitPrice: number;
  code?: string;
}
export const FixedPricingTable = ({
  control,
  pricingDetail,
  savedFixedValues,
  onSave,
}: {
  control: Control<any>;
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  savedFixedValues: any[];
  onSave: () => void;
}) => {
  const { fields, replace } = useFieldArray({ control, name: 'fixedValues' });
  const tableRef = useRef<HTMLTableElement>(null);

  const { data, loading } = useQuery(GET_PRODUCTS_BY_IDS, {
    variables: {
      ids:
        pricingDetail?.applyType === 'product'
          ? pricingDetail?.products || []
          : undefined,
      categoryIds:
        pricingDetail?.applyType === 'category'
          ? pricingDetail?.categories || []
          : undefined,
      limit: 100,
    },
    skip: !pricingDetail,
    fetchPolicy: 'cache-and-network',
  });

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');

  const watchedFixedValues = useWatch({
    control,
    name: 'fixedValues',
  });

  const savedProductIds = useMemo(() => {
    return (savedFixedValues || []).map((fv) => fv.productId);
  }, [savedFixedValues]);

  const { data: savedProductsData, loading: savedProductsLoading } = useQuery(
    GET_PRODUCTS_BY_IDS,
    {
      variables: {
        ids: savedProductIds,
        limit: 100,
      },
      skip: !savedProductIds.length,
      fetchPolicy: 'cache-and-network',
    },
  );

  const activeProducts: IProductRow[] = data?.productsMain?.list || [];
  const savedProducts: IProductRow[] =
    savedProductsData?.productsMain?.list || [];

  const allProducts = useMemo(() => {
    const map = new Map<string, IProductRow>();
    activeProducts.forEach((p) => map.set(p._id, p));
    savedProducts.forEach((p) => map.set(p._id, p));

    savedFixedValues.forEach((fv) => {
      if (!map.has(fv.productId)) {
        map.set(fv.productId, {
          _id: fv.productId,
          name: `Unknown Product (${fv.productId})`,
          uom: fv.uom || '',
          unitPrice: fv.unitPrice || 0,
        });
      }
    });

    return Array.from(map.values());
  }, [activeProducts, savedProducts, savedFixedValues]);

  useEffect(() => {
    if (!allProducts.length) return;

    const rows = allProducts.map((product) => {
      const existing = savedFixedValues?.find(
        (fv: any) => fv.productId === product._id,
      );
      return {
        _id: existing?._id ?? undefined,
        productId: product._id,
        uom: product.uom || existing?.uom || '',
        unitPrice: product.unitPrice ?? existing?.unitPrice ?? 0,
        newPrice: existing?.newPrice ?? product.unitPrice ?? 0,
      };
    });

    replace(rows);
  }, [allProducts.length, savedFixedValues.length]);

  const isLoading =
    loading || (savedProductIds.length > 0 && savedProductsLoading);

  if (isLoading) return <div>Loading products...</div>;
  if (!allProducts.length && !isLoading)
    return <div>No products selected on this plan.</div>;

  const renderStatusBadge = (status: 'NEW' | 'SAVED' | 'STALE') => {
    let styles = {};
    if (status === 'NEW') {
      styles = { background: '#e0f2fe', color: '#0369a1' };
    } else if (status === 'SAVED') {
      styles = { background: '#dcfce7', color: '#15803d' };
    } else {
      styles = { background: '#fef3c7', color: '#b45309' };
    }
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          ...styles,
        }}
      >
        {status}
      </span>
    );
  };

  const renderDiffPrice = (diff: number) => {
    let text = '0';
    let color = '#7f8c8d';
    let fontWeight = 'normal';

    if (diff > 0) {
      text = `+${diff.toLocaleString()}`;
      color = '#10b981';
      fontWeight = 'semibold';
    } else if (diff < 0) {
      text = diff.toLocaleString();
      color = '#ef4444';
      fontWeight = 'semibold';
    }

    return <span style={{ color, fontWeight }}>{text}</span>;
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <Input
            placeholder="Search by product name or code..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div style={{ width: '200px' }}>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <Select.Trigger>
              <Select.Value placeholder="Filter by status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Statuses</Select.Item>
              <Select.Item value="NEW">NEW</Select.Item>
              <Select.Item value="SAVED">SAVED</Select.Item>
              <Select.Item value="STALE">STALE</Select.Item>
            </Select.Content>
          </Select>
        </div>
        <div style={{ width: '200px' }}>
          <Select value={diffFilter} onValueChange={setDiffFilter}>
            <Select.Trigger>
              <Select.Value placeholder="Filter by price diff" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Price Changes</Select.Item>
              <Select.Item value="increased">Increased (+)</Select.Item>
              <Select.Item value="decreased">Decreased (-)</Select.Item>
              <Select.Item value="no_change">No Change (0)</Select.Item>
            </Select.Content>
          </Select>
        </div>
      </div>

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
              <Table.Head>Diff Price</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {fields.map((field, index) => {
              const product = allProducts.find(
                (p) => p._id === (field as any).productId,
              );
              if (!product) return null;

              const isActive = activeProducts.some(
                (ap) => ap._id === product._id,
              );
              const hasSaved = savedFixedValues.some(
                (fv) => fv.productId === product._id,
              );

              let status: 'NEW' | 'SAVED' | 'STALE' = 'NEW';
              if (isActive && !hasSaved) {
                status = 'NEW';
              } else if (isActive && hasSaved) {
                status = 'SAVED';
              } else if (!isActive && hasSaved) {
                status = 'STALE';
              }

              const matchesSearch =
                !searchText ||
                product.name.toLowerCase().includes(searchText.toLowerCase()) ||
                (product.code &&
                  product.code
                    .toLowerCase()
                    .includes(searchText.toLowerCase()));

              const matchesStatus =
                statusFilter === 'all' || status === statusFilter;

              const watchedValue = watchedFixedValues?.[index];
              const newPrice = watchedValue?.newPrice ?? product.unitPrice ?? 0;
              const unitPrice =
                watchedValue?.unitPrice ?? product.unitPrice ?? 0;
              const diffPrice = newPrice - unitPrice;

              let matchesDiff = true;
              if (diffFilter === 'increased') {
                matchesDiff = diffPrice > 0;
              } else if (diffFilter === 'decreased') {
                matchesDiff = diffPrice < 0;
              } else if (diffFilter === 'no_change') {
                matchesDiff = diffPrice === 0;
              }

              if (!matchesSearch || !matchesStatus || !matchesDiff) {
                return null;
              }

              return (
                <FixedPricingRow
                  key={field.id}
                  rowId={field.id}
                  index={index}
                  control={control}
                  product={product}
                  status={status}
                  onSave={onSave}
                  renderDiffPrice={renderDiffPrice}
                  renderStatusBadge={renderStatusBadge}
                />
              );
            })}
          </Table.Body>
        </Table>
      </RecordTableHotkeyProvider>
    </>
  );
};

const FixedPricingRow = ({
  rowId,
  index,
  control,
  product,
  status,
  onSave,
  renderDiffPrice,
  renderStatusBadge,
}: {
  rowId: string;
  index: number;
  control: Control<any>;
  product: IProductRow;
  status: 'NEW' | 'SAVED' | 'STALE';
  onSave: () => void;
  renderDiffPrice: (diff: number) => any;
  renderStatusBadge: (status: 'NEW' | 'SAVED' | 'STALE') => any;
}) => {
  const watchedValue = useWatch({
    control,
    name: `fixedValues.${index}`,
  });

  const newPrice = watchedValue?.newPrice ?? product.unitPrice ?? 0;
  const unitPrice = watchedValue?.unitPrice ?? product.unitPrice ?? 0;
  const diffPrice = newPrice - unitPrice;

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

      <Table.Cell>
        <RecordTableInlineCell>
          {renderDiffPrice(diffPrice)}
        </RecordTableInlineCell>
      </Table.Cell>

      <Table.Cell>
        <RecordTableInlineCell>
          {renderStatusBadge(status)}
        </RecordTableInlineCell>
      </Table.Cell>
    </Table.Row>
  );
};
