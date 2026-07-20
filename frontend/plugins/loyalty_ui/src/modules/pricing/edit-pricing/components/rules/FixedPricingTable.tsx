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
  Input,
  Select,
  Button,
  useToast,
} from 'erxes-ui';
import { useRef, useEffect, useState } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { PRICING_FIXED_VALUES_PAGE } from '~/modules/pricing/graphql/queries';
import { PRICING_FIXED_VALUES_BULK_EDIT } from '~/modules/pricing/graphql/mutations';

type FixedPricingStatus = 'NEW' | 'SAVED' | 'STALE';

interface IPageItem {
  _id: string | null;
  productId: string;
  productName: string;
  sortField: string;
  uom: string;
  unitPrice: number;
  newPrice: number;
  status: FixedPricingStatus;
}

interface IProductRow {
  _id: string;
  name: string;
  uom: string;
  unitPrice: number;
  code?: string;
}

const readFileAsText = (file: File): Promise<string> => file.text();

type ColIndices = {
  productCode: number;
  newPrice: number;
  uom: number;
  unitPrice: number;
};

const detectColumns = (headerCells: string[]): ColIndices => {
  const cols: ColIndices = {
    productCode: 0,
    newPrice: 1,
    uom: 2,
    unitPrice: 3,
  };
  headerCells.forEach((cell, i) => {
    if (cell === 'productcode' || cell === 'product code') cols.productCode = i;
    else if (cell === 'newprice' || cell === 'new price') cols.newPrice = i;
    else if (cell === 'uom' || cell === 'unit of measure') cols.uom = i;
    else if (cell === 'unitprice' || cell === 'unit price') cols.unitPrice = i;
  });
  return cols;
};

const parseRow = (line: string, cols: ColIndices) => {
  const parts = line.split(',').map((s) => s.trim());
  const productCode = parts[cols.productCode];
  const price = Number.parseFloat(parts[cols.newPrice]);
  if (!productCode || Number.isNaN(price)) return null;
  const uom = parts[cols.uom] || undefined;
  const up = Number.parseFloat(parts[cols.unitPrice]);
  return {
    productCode,
    newPrice: price,
    uom,
    unitPrice: Number.isNaN(up) ? undefined : up,
  };
};

const parseCsvText = (text: string) => {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return null;
  const firstCells = lines[0].split(',').map((s) => s.trim().toLowerCase());
  const hasHeader = Number.isNaN(Number.parseFloat(firstCells[1]));
  const cols = hasHeader
    ? detectColumns(firstCells)
    : { productCode: 0, newPrice: 1, uom: 2, unitPrice: 3 };
  const dataLines = hasHeader ? lines.slice(1) : lines;
  return dataLines.map((line) => parseRow(line, cols)).filter(Boolean);
};

const STATUS_BADGE_STYLES: Record<FixedPricingStatus, React.CSSProperties> = {
  NEW: { background: '#e0f2fe', color: '#0369a1' },
  SAVED: { background: '#dcfce7', color: '#15803d' },
  STALE: { background: '#fef3c7', color: '#b45309' },
};

const StatusBadge = ({ status }: { status: FixedPricingStatus }) => (
  <span
    style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: 'bold',
      textTransform: 'uppercase',
      ...STATUS_BADGE_STYLES[status],
    }}
  >
    {status}
  </span>
);

const DiffPrice = ({ diff }: { diff: number }) => {
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

const applyCustomPageSize = (
  raw: string,
  setPageSize: (n: number) => void,
  setCurrentPage: (n: number) => void,
) => {
  const n = Number.parseInt(raw, 10);
  if (n > 0) {
    setPageSize(n);
    setCurrentPage(1);
  }
};

export const FixedPricingTable = ({
  control,
  pricingId,
  onSave,
}: {
  control: Control<any>;
  pricingId: string;
  onSave: () => void;
}) => {
  const { fields, replace } = useFieldArray({ control, name: 'fixedValues' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const client = useApolloClient();
  const [bulkEdit, { loading: bulkLoading }] = useMutation(
    PRICING_FIXED_VALUES_BULK_EDIT,
  );

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [customPageSize, setCustomPageSize] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const watchedFixedValues = useWatch({ control, name: 'fixedValues' });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, loading } = useQuery(PRICING_FIXED_VALUES_PAGE, {
    variables: {
      pricingPlanId: pricingId,
      page: currentPage,
      perPage: pageSize,
      search: debouncedSearch,
    },
    skip: !pricingId,
    fetchPolicy: 'cache-and-network',
  });

  const pageResult = data?.pricingFixedValuesPage;
  const pageItems: IPageItem[] = pageResult?.list || [];
  const totalCount: number = pageResult?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const pageItemsKey = JSON.stringify(pageItems);

  useEffect(() => {
    if (!pageItems.length) return;
    replace(
      pageItems.map((item) => ({
        _id: item._id ?? undefined,
        productId: item.productId,
        sortField: item.sortField,
        uom: item.uom,
        unitPrice: item.unitPrice,
        newPrice: item.newPrice,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageItemsKey, replace]);

  const handlePageChange = (newPage: number) => {
    const hasDirtyRows = watchedFixedValues?.some((fv, index) => {
      const item = pageItems[index];
      return item && fv?.newPrice !== item.newPrice;
    });
    if (hasDirtyRows) onSave();
    setCurrentPage(newPage);
  };

  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    if (!file) return;

    const text = await readFileAsText(file);
    const productsData = parseCsvText(text);

    if (!productsData?.length) {
      toast({ title: 'No valid rows found in CSV', variant: 'destructive' });
      return;
    }

    try {
      const result = await bulkEdit({
        variables: { pricingPlanId: pricingId, productsData },
      });
      const { count = 0, notFound = [] } =
        result.data?.pricingFixedValuesBulkEdit ?? {};
      await client.refetchQueries({ include: ['PricingFixedValuesPage'] });
      if (notFound.length) {
        toast({
          title: `Imported ${count} rows. ${
            notFound.length
          } product code(s) not found: ${notFound.join(', ')}`,
          variant: 'destructive',
        });
      } else {
        toast({ title: `Imported ${count} rows successfully` });
      }
    } catch (err: any) {
      toast({ title: err?.message || 'Import failed', variant: 'destructive' });
    }
  };

  const filteredIndices: number[] = [];
  fields.forEach((field, index) => {
    const item = pageItems[index];
    if (!item) return;
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    const watchedValue = watchedFixedValues?.[index];
    const newPrice = watchedValue?.newPrice ?? item.unitPrice ?? 0;
    const unitPrice = watchedValue?.unitPrice ?? item.unitPrice ?? 0;
    const diffPrice = newPrice - unitPrice;
    let matchesDiff = true;
    if (diffFilter === 'increased') matchesDiff = diffPrice > 0;
    else if (diffFilter === 'decreased') matchesDiff = diffPrice < 0;
    else if (diffFilter === 'no_change') matchesDiff = diffPrice === 0;
    if (matchesStatus && matchesDiff) filteredIndices.push(index);
  });

  const renderTableBody = () => {
    if (loading && !pageItems.length) {
      return (
        <Table.Row>
          <Table.Cell
            colSpan={7}
            style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}
          >
            Loading...
          </Table.Cell>
        </Table.Row>
      );
    }
    if (!pageItems.length) {
      return (
        <Table.Row>
          <Table.Cell
            colSpan={7}
            style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}
          >
            No products found.
          </Table.Cell>
        </Table.Row>
      );
    }
    return filteredIndices.map((index) => {
      const field = fields[index];
      const item = pageItems[index];
      const product: IProductRow = {
        _id: item.productId,
        name: item.productName,
        uom: item.uom,
        unitPrice: item.unitPrice,
        code: item.sortField,
      };
      return (
        <FixedPricingRow
          key={field.id}
          rowId={field.id}
          index={index}
          control={control}
          product={product}
          status={item.status}
          onSave={onSave}
        />
      );
    });
  };

  const handlePageSizeChange = (v: string) => {
    if (v === 'custom') {
      setIsCustomMode(true);
      setCustomPageSize('');
    } else {
      setIsCustomMode(false);
      setPageSize(Number(v));
      setCustomPageSize('');
      setCurrentPage(1);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
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
            placeholder="Search by product"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleCsvFile}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={bulkLoading}
          onClick={() => fileInputRef.current?.click()}
        >
          {bulkLoading ? 'Importing…' : 'Import CSV'}
        </Button>
        <div style={{ width: '200px' }}>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setCurrentPage(1);
            }}
          >
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
          <Select
            value={diffFilter}
            onValueChange={(v) => {
              setDiffFilter(v);
              setCurrentPage(1);
            }}
          >
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Select
            value={
              [5, 10, 50, 100].includes(pageSize) ? String(pageSize) : 'custom'
            }
            onValueChange={handlePageSizeChange}
          >
            <Select.Trigger style={{ width: '130px' }}>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="5">5 / page</Select.Item>
              <Select.Item value="10">10 / page</Select.Item>
              <Select.Item value="50">50 / page</Select.Item>
              <Select.Item value="100">100 / page</Select.Item>
              <Select.Item value="custom">Custom</Select.Item>
            </Select.Content>
          </Select>
          {isCustomMode && (
            <input
              type="number"
              min={1}
              placeholder="e.g. 25"
              value={customPageSize}
              onChange={(e) => setCustomPageSize(e.target.value)}
              onBlur={() =>
                applyCustomPageSize(customPageSize, setPageSize, setCurrentPage)
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  applyCustomPageSize(
                    customPageSize,
                    setPageSize,
                    setCurrentPage,
                  );
                }
              }}
              style={{
                width: '70px',
                padding: '4px 8px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
          )}
        </div>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        <RecordTableHotkeyProvider
          columnLength={1}
          rowLength={filteredIndices.length}
          scope="pricingFixedValues"
        >
          <Table>
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
            <Table.Body>{renderTableBody()}</Table.Body>
          </Table>
        </RecordTableHotkeyProvider>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '12px',
          justifyContent: 'flex-end',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '13px', color: '#6b7280' }}>
          {totalCount} results · Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            padding: '4px 10px',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.4 : 1,
          }}
        >
          ‹ Prev
        </button>
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          style={{
            padding: '4px 10px',
            cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage >= totalPages ? 0.4 : 1,
          }}
        >
          Next ›
        </button>
      </div>
    </div>
  );
};

const FixedPricingRow = ({
  rowId,
  index,
  control,
  product,
  status,
  onSave,
}: {
  rowId: string;
  index: number;
  control: Control<any>;
  product: IProductRow;
  status: FixedPricingStatus;
  onSave: () => void;
}) => {
  const watchedValue = useWatch({ control, name: `fixedValues.${index}` });
  const newPrice = watchedValue?.newPrice ?? product.unitPrice ?? 0;
  const unitPrice = watchedValue?.unitPrice ?? product.unitPrice ?? 0;
  const diffPrice = newPrice - unitPrice;

  const handleNewPriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSave();
  };

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
                    onKeyDown={handleNewPriceKeyDown}
                  />
                </RecordTableInlineCell.Content>
              </PopoverScoped>
            )}
          />
        </Table.Cell>
      </RecordTableHotKeyControl>

      <Table.Cell>
        <RecordTableInlineCell>
          <DiffPrice diff={diffPrice} />
        </RecordTableInlineCell>
      </Table.Cell>

      <Table.Cell>
        <RecordTableInlineCell>
          <StatusBadge status={status} />
        </RecordTableInlineCell>
      </Table.Cell>
    </Table.Row>
  );
};
