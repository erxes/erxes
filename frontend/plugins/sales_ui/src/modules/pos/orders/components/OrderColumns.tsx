import {
  IconLabel,
  IconMobiledata,
  IconClock,
  IconUser,
  IconTag,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { useTranslation } from 'react-i18next';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Badge,
} from 'erxes-ui';

import { IOrder } from '@/pos/types/order';
import { IUser } from 'ui-modules/modules';
import { ordersMoreColumn } from '@/pos/orders/components/OrdersMoreColumn';
import { ClickableBillNumber } from './ClickableBillNumber';

interface PaymentSummary {
  [key: string]: number | string;
}

interface PaymentRow {
  original: IOrder;
}

// posOrdersSummary keys are payment titles (e.g. 'Invoice', 'QPay')
// paidAmounts items: { type, amount, title } — title may be missing on old data
// Build two maps: by title AND by type, merge both for lookup
interface IPaidAmount {
  type?: string;
  amount?: number;
  title?: string;
}

const getPaidAmountsMap = (
  paidAmounts: IPaidAmount[] | null | undefined,
): Record<string, number> => {
  if (!paidAmounts || !Array.isArray(paidAmounts)) return {};

  return paidAmounts.reduce<Record<string, number>>((acc, item) => {
    const amount = Number(item?.amount || 0);
    if (item?.title) acc[item.title] = (acc[item.title] || 0) + amount;
    if (item?.type) acc[item.type] = (acc[item.type] || 0) + amount;
    return acc;
  }, {});
};

const NumberHeader = () => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={IconLabel} label={t('bill-number')} />;
};

const PaidDateHeader = () => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={IconMobiledata} label={t('date')} />;
};

const CashAmountHeader = () => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={IconLabel} label={t('cash-amount')} />;
};

const MobileAmountHeader = () => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={IconLabel} label={t('mobile-amount')} />;
};

const TotalAmountHeader = () => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={IconLabel} label={t('amount')} />;
};

const CustomerTypeHeader = () => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={IconClock} label={t('customer')} />;
};

const BrokerTypeHeader = () => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={IconUser} label={t('broker-type')} />;
};

const BrokerHeader = () => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={IconUser} label={t('broker')} />;
};

const PosNameHeader = () => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={IconUser} label={t('pos')} />;
};

const TypeHeader = () => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={IconTag} label={t('type')} />;
};

const UserHeader = () => {
  const { t } = useTranslation('sales');
  return <RecordTable.InlineHead icon={IconUser} label={t('user')} />;
};

const DynamicPaymentHeader = ({ title }: { title: string }) => {
  const { t } = useTranslation('sales');
  return (
    <RecordTable.InlineHead
      icon={IconClock}
      label={t(title, { defaultValue: title })}
    />
  );
};

export const generateOtherPaymentColumns = (summary?: PaymentSummary) => {
  const otherPayTitles = (summary ? Object.keys(summary) : [])
    .filter(
      (a) =>
        !['_id', 'count', 'cashAmount', 'mobileAmount', 'totalAmount'].includes(
          a,
        ),
    )
    .sort();

  return otherPayTitles.map((title: string, index) => ({
    id: `${title}_${index}`,
    header: () => <DynamicPaymentHeader title={title} />,
    cell: ({ row }: { row: PaymentRow }) => {
      const order = row.original;
      const dynamicAmounts = getPaidAmountsMap(order.paidAmounts);
      const value = dynamicAmounts[title] || 0;

      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value ? value.toLocaleString() : ''} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  }));
};

export const firstOrderColumns: ColumnDef<IOrder>[] = [
  ordersMoreColumn,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <NumberHeader />,
    cell: ({ cell, row }) => {
      return (
        <ClickableBillNumber value={cell.getValue() as string} row={row} />
      );
    },
  },
  {
    id: 'paidDate',
    accessorKey: 'paidDate',
    header: () => <PaidDateHeader />,
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
    sortingFn: (rowA, rowB) => {
      const dateA = rowA.original.paidDate
        ? new Date(rowA.original.paidDate)
        : new Date(0);
      const dateB = rowB.original.paidDate
        ? new Date(rowB.original.paidDate)
        : new Date(0);
      return dateA.getTime() - dateB.getTime();
    },
  },
  {
    id: 'cashAmount',
    accessorKey: 'cashAmount',
    header: () => <CashAmountHeader />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString()} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'mobileAmount',
    accessorKey: 'mobileAmount',
    header: () => <MobileAmountHeader />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString()} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
];

export const secondOrderColumns: ColumnDef<IOrder>[] = [
  {
    id: 'totalAmount',
    accessorKey: 'totalAmount',
    header: () => <TotalAmountHeader />,
    cell: ({ cell }) => {
      const value = cell.getValue() as number;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value?.toLocaleString()} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'customerType',
    accessorKey: 'customerType',
    header: () => <CustomerTypeHeader />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'brokerType',
    accessorKey: 'brokerType',
    header: () => <BrokerTypeHeader />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'brokerId',
    accessorKey: 'brokerId',
    header: () => <BrokerHeader />,
    cell: ({ cell }) => {
      const value = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={value} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'posName',
    accessorKey: 'posName',
    header: () => <PosNameHeader />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: () => <TypeHeader />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge variant="default">{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
  {
    id: 'user',
    accessorKey: 'user',
    header: () => <UserHeader />,
    cell: ({ cell }) => {
      const user = cell.getValue() as IUser;
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={user?.username || ''} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
];

export const orderColumns: ColumnDef<IOrder>[] = [
  ...firstOrderColumns,
  ...secondOrderColumns,
];
