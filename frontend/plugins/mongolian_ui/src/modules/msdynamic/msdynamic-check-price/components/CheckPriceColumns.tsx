import {
  IconCode,
  IconHash,
  IconCircleCheck,
  IconCategory,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import {
  IPriceItem,
  PriceStatus,
  PRICE_STATUS_LABELS,
} from '../types/checkPrice';

export const checkPriceColumns: ColumnDef<IPriceItem>[] = [
  RecordTable.checkboxColumn as ColumnDef<IPriceItem>,
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Type" icon={IconCategory} />,
    cell: ({ cell }) => {
      const value = cell.getValue() as PriceStatus;
      return (
        <RecordTableInlineCell>
          <span className="text-xs font-medium">
            {PRICE_STATUS_LABELS[value]}
          </span>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'code',
    accessorKey: 'Item_No',
    header: () => <RecordTable.InlineHead label="Code" icon={IconCode} />,
    cell: ({ cell }) => {
      const row = cell.row.original;
      const displayCode = row.status === 'DELETE' ? row.code : row.Item_No;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={displayCode || ''} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'unitPrice',
    accessorKey: 'Unit_Price',
    header: () => <RecordTable.InlineHead label="Unit price" icon={IconHash} />,
    cell: ({ cell }) => {
      const row = cell.row.original;
      const price = row.status === 'DELETE' ? row.unitPrice : row.Unit_Price;
      const numericPrice =
        price === null || price === undefined ? null : Number(price);
      const isValid = numericPrice !== null && !Number.isNaN(numericPrice);
      return (
        <RecordTableInlineCell>
          {isValid ? numericPrice.toLocaleString() : ''}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'endingDate',
    accessorKey: 'Ending_Date',
    header: () => (
      <RecordTable.InlineHead label="Ending Date" icon={IconHash} />
    ),
    cell: ({ cell }) => {
      const row = cell.row.original;
      const value = row.status === 'DELETE' ? '' : row.Ending_Date;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value || ''} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'syncedStatus',
    accessorKey: 'isSynced',
    header: () => (
      <RecordTable.InlineHead label="Status" icon={IconCircleCheck} />
    ),
    cell: ({ row }) => {
      const isSynced = row.original.isSynced;
      return (
        <RecordTableInlineCell>
          {isSynced ? (
            <Badge variant="success">Synced</Badge>
          ) : (
            <Badge variant="warning">Pending</Badge>
          )}
        </RecordTableInlineCell>
      );
    },
  },
];
