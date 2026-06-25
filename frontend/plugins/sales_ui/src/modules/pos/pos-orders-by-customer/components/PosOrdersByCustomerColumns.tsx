import { IconLabel } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';

import { IPosOrdersByCustomer } from '@/pos/pos-orders-by-customer/types/posOrdersByCustomerType';
import { PosOrdersByCustomerMoreColumn } from '@/pos/pos-orders-by-customer/components/PosOrdersByCustomerMoreColumn';
import { useTranslation } from 'react-i18next';

export const PosOrdersByCustomerColumns: ColumnDef<IPosOrdersByCustomer>[] = [
  PosOrdersByCustomerMoreColumn,
  {
    id: 'type',
    accessorKey: 'customerDetail.state',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconLabel} label={t('type')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'customerName',
    accessorKey: 'customerDetail.primaryName',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconLabel} label={t('customer-name')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'customerEmail',
    accessorKey: 'customerDetail.emails.email',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconLabel} label={t('customer-email')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'totalOrders',
    accessorKey: 'totalOrders',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconLabel} label={t('orders-count')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconLabel} label={t('total-amount')} />;
    },
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
];
