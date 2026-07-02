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
} from 'erxes-ui';
import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@apollo/client';
import { PRICING_FIXED_VALUES_PAGE } from '~/modules/pricing/graphql/queries';

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
  const tableRef = useRef<HTMLTableElement>(null);

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

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
      perPage: PAGE_SIZE,
      search: debouncedSearch,
    },
    skip: !pricingId,
    fetchPolicy: 'cache-and-network',
  });

  const pageResult = data?.pricingFixedValuesPage;
  const pageItems: IPageItem[] = pageResult?.list || [];
  const totalCount: number = pageResult?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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
  }, [JSON.stringify(pageItems)]);

  const handlePageChange = (newPage: number) => {
    onSave();
    setCurrentPage(newPage);
  };

  const renderStatusBadge = (status: FixedPricingStatus) => {
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
          renderDiffPrice={renderDiffPrice}
          renderStatusBadge={renderStatusBadge}
        />
      );
    });
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
            placeholder="Search by product"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
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
      </div>

      <RecordTableHotkeyProvider
        columnLength={1}
        rowLength={filteredIndices.length}
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
          <Table.Body>{renderTableBody()}</Table.Body>
        </Table>
      </RecordTableHotkeyProvider>

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '12px',
            justifyContent: 'flex-end',
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
      )}
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
  status: FixedPricingStatus;
  onSave: () => void;
  renderDiffPrice: (diff: number) => any;
  renderStatusBadge: (status: FixedPricingStatus) => any;
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
