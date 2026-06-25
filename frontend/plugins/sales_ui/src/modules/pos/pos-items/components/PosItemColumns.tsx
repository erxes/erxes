import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconClock,
  IconUser,
  TablerIcon,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';

import { IPosItem } from '@/pos/pos-items/types/posItem';
import { PosItemMoreColumn } from '@/pos/pos-items/components/PosItemMoreColumns';
import { ClickableBillNumber } from './ClickableBillNumber';
import { useTranslation } from 'react-i18next';

const fmt = (val: number | null | undefined) =>
  val != null ? val.toLocaleString() : '0';

const PosItemHeaderCell = ({ icon, label }: { icon: TablerIcon; label: string }) => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={icon} label={t(label)} />;
};

export const PosItemColumns: ColumnDef<IPosItem>[] = [
  PosItemMoreColumn,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <PosItemHeaderCell icon={IconLabel} label="number" />,
    cell: ({ cell, row }) => (
      <ClickableBillNumber value={cell.getValue() as string} row={row} />
    ),
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <PosItemHeaderCell icon={IconLabel} label="created-date" />,
    cell: ({ cell }) => {
      const val = cell.getValue() as string;
      return (
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <TextOverflowTooltip
            value={val ? new Date(val).toLocaleDateString() : ''}
          />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'createdTime',
    accessorKey: 'createdAt',
    header: () => <PosItemHeaderCell icon={IconLabel} label="created-time" />,
    cell: ({ cell }) => {
      const val = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={val ? new Date(val).toLocaleTimeString() : ''}
          />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'posName',
    accessorKey: 'posName',
    header: () => <PosItemHeaderCell icon={IconBuilding} label="pos" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'branch',
    accessorKey: 'branch',
    header: () => <PosItemHeaderCell icon={IconChartBar} label="branch" />,
    cell: ({ row }) => {
      const b = row.original.branch;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={b ? `${b.order} - ${b.title}` : ''} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'department',
    accessorKey: 'department',
    header: () => <PosItemHeaderCell icon={IconClock} label="department" />,
    cell: ({ row }) => {
      const d = row.original.department;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={d ? `${d.order} - ${d.title}` : ''} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'user',
    accessorKey: 'user',
    header: () => <PosItemHeaderCell icon={IconUser} label="cashier" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={row.original.user?.email || ''} />
      </RecordTableInlineCell>
    ),
    size: 200,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <PosItemHeaderCell icon={IconUser} label="type" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="default">{(cell.getValue() as string) || ''}</Badge>
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'billType',
    accessorKey: 'billType',
    header: () => <PosItemHeaderCell icon={IconUser} label="bill-type" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'registerNumber',
    accessorKey: 'registerNumber',
    header: () => <PosItemHeaderCell icon={IconUser} label="company-rd" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'customerType',
    accessorKey: 'customerType',
    header: () => <PosItemHeaderCell icon={IconUser} label="customer-type" />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          {value ? <Badge variant="default">{value}</Badge> : ''}
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'customer',
    accessorKey: 'customer.primaryEmail',
    header: () => <PosItemHeaderCell icon={IconUser} label="customer" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={(cell.getValue() as string) || ''} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'barcode',
    header: () => <PosItemHeaderCell icon={IconUser} label="barcode" />,
    cell: ({ row }) => {
      const item = row.original.items;
      const barcodes = item?.barcodes ?? item?.product?.barcodes ?? [];
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={barcodes.join(', ')} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'factor',
    accessorKey: 'factor',
    header: () => <PosItemHeaderCell icon={IconUser} label="factor" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={fmt(cell.getValue() as number)} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'code',
    header: () => <PosItemHeaderCell icon={IconUser} label="code" />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={item?.product?.code || ''} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'categoryCode',
    header: () => <PosItemHeaderCell icon={IconUser} label="category-code" />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={
              item?.productCategoryCode ||
              item?.productCategory?.code ||
              item?.product?.productCategory?.code ||
              ''
            }
          />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'categoryName',
    header: () => <PosItemHeaderCell icon={IconUser} label="category-name" />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={
              item?.productCategoryName ||
              item?.productCategory?.name ||
              item?.product?.productCategory?.name ||
              ''
            }
          />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'name',
    header: () => <PosItemHeaderCell icon={IconUser} label="name" />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={item?.product?.name || ''} />
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'count',
    header: () => <PosItemHeaderCell icon={IconUser} label="count" />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip
            value={item?.count != null ? String(item.count) : '0'}
          />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'firstPrice',
    header: () => <PosItemHeaderCell icon={IconUser} label="first-price" />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={fmt(item?.unitPrice)} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'discount',
    header: () => <PosItemHeaderCell icon={IconUser} label="discount" />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={fmt(item?.discountAmount)} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'discountType',
    header: () => <PosItemHeaderCell icon={IconUser} label="discount-type" />,
    cell: ({ row }) => {
      const item = row.original.items;
      let value = '';
      if (item?.discountPercent && item.discountPercent > 0) {
        value = 'Percent';
      } else if (item?.discountAmount && item.discountAmount > 0) {
        value = 'Amount';
      }
      return (
        <RecordTableInlineCell>
          {value ? <Badge variant="default">{value}</Badge> : ''}
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'salePrice',
    header: () => <PosItemHeaderCell icon={IconUser} label="sale-price" />,
    cell: ({ row }) => {
      const item = row.original.items;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={fmt(item?.unitPrice)} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => <PosItemHeaderCell icon={IconUser} label="amount" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={fmt(cell.getValue() as number)} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'paymentType',
    accessorKey: 'paidAmounts',
    header: () => <PosItemHeaderCell icon={IconUser} label="payment-type" />,
    cell: ({ row }) => {
      const raw = row.original.paidAmounts;
      const paidAmounts: Array<{ type?: string }> = Array.isArray(raw)
        ? raw
        : raw
        ? [raw as { type?: string }]
        : [];
      const types = paidAmounts
        .map((pa) => pa.type)
        .filter((t): t is string => Boolean(t))
        .join(', ');
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={types} />
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
];
