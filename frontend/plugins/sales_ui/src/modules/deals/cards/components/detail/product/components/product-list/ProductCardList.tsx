import type { DealProductData } from '@/deals/utils/dealJson';
import { Cell, flexRender, Header, Row } from '@tanstack/react-table';
import { Button, RecordTable } from 'erxes-ui';
import {
  IconChevronRight,
  IconChevronsDown,
  IconChevronsUp,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { ProductTypeIcon } from '@/deals/cards/components/detail/product/components/product-table/ProductTypeIcon';

const HEAD_COLUMN_IDS = ['checkbox', 'type', 'name', 'more', 'amount'];

type THeaders = Map<string, Header<DealProductData, unknown>>;

const renderCell = (cell?: Cell<DealProductData, unknown>) =>
  cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null;

const renderHeader = (header?: Header<DealProductData, unknown>) =>
  header
    ? flexRender(header.column.columnDef.header, header.getContext())
    : null;

const ProductCardField = ({
  cell,
  headers,
}: {
  cell: Cell<DealProductData, unknown>;
  headers: THeaders;
}) => (
  <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center min-h-8">
    <div className="min-w-0 truncate text-muted-foreground [&_svg]:size-4! [&_svg]:shrink-0 [&>div]:gap-1.5">
      {renderHeader(headers.get(cell.column.id))}
    </div>
    <div className="min-w-0 h-8 [&_.px-2]:px-0! [&_button:not([role=checkbox])]:px-0! [&_button:not([role=checkbox])]:border-0! [&_button:not([role=checkbox])]:shadow-none!">
      {renderCell(cell)}
    </div>
  </div>
);

const ProductCard = ({
  row,
  headers,
  open,
  onToggle,
}: {
  row: Row<DealProductData>;
  headers: THeaders;
  open: boolean;
  onToggle: () => void;
}) => {
  const { t } = useTranslation('sales');
  const cells = row.getVisibleCells();
  const find = (id: string) => cells.find((cell) => cell.column.id === id);
  const amount = find('amount');
  const quantity = row.original.uomInfo?.quantity ?? row.original.quantity;

  return (
    <div className="rounded-lg border bg-background">
      <div className="flex h-9 items-center gap-2 px-2">
        <div className="w-4 shrink-0 [&>*]:p-0!">
          {renderCell(find('checkbox'))}
        </div>
        <div className="flex w-4 shrink-0 justify-center">
          <ProductTypeIcon type={row.original.product?.type || ''} compact />
        </div>
        <div className="min-w-0 flex-1 [&>*]:px-0!">
          {renderCell(find('name'))}
        </div>
        <span className="shrink-0 text-muted-foreground tabular-nums">
          ×{quantity ?? 0}
        </span>
        <div className="w-7 shrink-0">{renderCell(find('more'))}</div>
        <Button
          variant="ghost"
          size="icon"
          className="size-5 shrink-0 text-muted-foreground"
          aria-label={t('show-details')}
          aria-expanded={open}
          onClick={onToggle}
        >
          <IconChevronRight
            className={open ? 'size-3.5 rotate-90' : 'size-3.5'}
          />
        </Button>
      </div>
      {open && (
        <div className="grid grid-cols-2 gap-x-3 border-t px-2 py-1">
          {cells
            .filter((cell) => !HEAD_COLUMN_IDS.includes(cell.column.id))
            .map((cell) => (
              <ProductCardField key={cell.id} cell={cell} headers={headers} />
            ))}
        </div>
      )}
      {amount && (
        <div className="flex h-9 items-center justify-between gap-2 border-t px-2">
          <div className="min-w-0 truncate text-muted-foreground">
            {renderHeader(headers.get('amount'))}
          </div>
          <div className="min-w-0 font-semibold">{renderCell(amount)}</div>
        </div>
      )}
    </div>
  );
};

export const ProductCardList = ({
  expandedIds,
  onToggleExpanded,
  onExpandedChange,
}: {
  expandedIds: string[];
  onToggleExpanded: (productDataId: string) => void;
  onExpandedChange: (productDataIds: string[]) => void;
}) => {
  const { t } = useTranslation('sales');
  const { table } = RecordTable.useRecordTable();
  const rowIds = table.getRowModel().rows.map((row) => row.original._id);
  const allExpanded =
    rowIds.length > 0 && rowIds.every((id) => expandedIds.includes(id));
  const headers: THeaders = new Map(
    table.getFlatHeaders().map((header) => [header.column.id, header] as const),
  );
  const selectAll = headers.get('checkbox');

  return (
    <div className="flex flex-col gap-2 text-xs [&_*]:text-xs!">
      {selectAll && (
        <div className="flex h-9 items-center gap-2 rounded-lg border bg-background px-2">
          <div className="w-4 shrink-0 [&>*]:p-0!">
            {renderHeader(selectAll)}
          </div>
          <div className="flex w-4 shrink-0 justify-center [&_button]:size-6 [&_button]:p-0">
            {renderHeader(headers.get('more'))}
          </div>
          <div className="min-w-0 flex-1 [&>*]:px-0!">
            {renderHeader(headers.get('name'))}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-5 shrink-0 text-muted-foreground"
            aria-label={allExpanded ? t('collapse-all') : t('expand-all')}
            title={allExpanded ? t('collapse-all') : t('expand-all')}
            aria-expanded={allExpanded}
            onClick={() => onExpandedChange(allExpanded ? [] : rowIds)}
          >
            {allExpanded ? (
              <IconChevronsUp className="size-3.5" />
            ) : (
              <IconChevronsDown className="size-3.5" />
            )}
          </Button>
        </div>
      )}
      {table.getRowModel().rows.map((row) => (
        <ProductCard
          key={row.id}
          row={row}
          headers={headers}
          open={expandedIds.includes(row.original._id)}
          onToggle={() => onToggleExpanded(row.original._id)}
        />
      ))}
    </div>
  );
};
