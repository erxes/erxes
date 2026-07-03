import { IconLabel } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';

import { IPosOrdersByCustomer } from '@/pos/pos-orders-by-customer/types/posOrdersByCustomerType';
import { PosOrdersByCustomerMoreColumn } from '@/pos/pos-orders-by-customer/components/PosOrdersByCustomerMoreColumn';
import type { TFunction } from 'i18next';

export const PosOrdersByCustomerColumns = (t: TFunction): ColumnDef<IPosOrdersByCustomer>[] => [
  PosOrdersByCustomerMoreColumn,
  {
    id: 'type',
    accessorKey: 'customerDetail.state',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('type')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'customerName',
    accessorKey: 'customerDetail.primaryName',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('customer-name')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'customerEmail',
    accessorKey: 'customerDetail.emails.email',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('customer-email')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'totalOrders',
    accessorKey: 'totalOrders',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('orders-count')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('total-amount')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
];
