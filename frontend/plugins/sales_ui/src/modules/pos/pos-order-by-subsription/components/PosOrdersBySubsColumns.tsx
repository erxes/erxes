import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconMobiledata,
  IconPhone,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';
import { IPosOrdersBySubs } from '@/pos/pos-order-by-subsription/types/PosOrderBySubs';
import { PosOrderBySubsMoreColumn } from '@/pos/pos-order-by-subsription/components/PosOrderBySubsMoreColumn';
import { useTranslation } from 'react-i18next';

export const PosOrdersBySubsColumns: ColumnDef<IPosOrdersBySubs>[] = [
  PosOrderBySubsMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IPosOrdersBySubs>,
  {
    id: 'group',
    accessorKey: 'group',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconLabel} label={t('group', 'Group')} />;
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
    id: 'count',
    accessorKey: 'count',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconMobiledata} label={t('count', 'Count')} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('sales');
      const value = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant={value ? 'success' : 'secondary'}>
            {value ? t('online', 'Online') : t('offline', 'Offline')}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'cashAmount',
    accessorKey: 'cashAmount',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconPhone} label={t('cash-amount', 'Cash Amount')} />;
    },
    cell: ({ cell }) => {
      const { t } = useTranslation('sales');
      const value = cell.getValue() as boolean;
      return (
        <RecordTableInlineCell>
          <Badge variant="default">{value ? t('on-server', 'On Server') : t('local-only', 'Local Only')}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'mobileAmount',
    accessorKey: 'mobileAmount',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconBuilding} label={t('mobile-amount', 'Mobile Amount')} />;
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
    id: 'amount',
    accessorKey: 'amount',
    header: () => {
      const { t } = useTranslation('sales');
      return <RecordTable.InlineHead icon={IconChartBar} label={t('amount', 'Amount')} />;
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
