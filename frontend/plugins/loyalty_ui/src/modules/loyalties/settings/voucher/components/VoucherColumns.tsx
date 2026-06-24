import {
  IconCalendar,
  IconCalendarEvent,
  IconTag,
  IconToggleLeft,
  IconTicket,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Switch,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IVoucher } from '../types/voucherTypes';
import { VoucherNameCell } from '../voucher-detail/components/VoucherNameCell';
import { voucherMoreColumn } from './VoucherMoreColumn';

const SafeRelativeDate = ({ value }: { value?: string }) => {
  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }

  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return <span className="text-muted-foreground">-</span>;
    }

    return (
      <RelativeDateDisplay value={value} asChild>
        <RelativeDateDisplay.Value value={value} />
      </RelativeDateDisplay>
    );
  } catch {
    return <span className="text-muted-foreground">-</span>;
  }
};

export const voucherColumns: (
  editStatus: (options: any) => void,
) => ColumnDef<IVoucher>[] = (editStatus) => [
  voucherMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IVoucher>,

  {
    id: 'title',
    accessorKey: 'title',
    header: () => {
      const { t } = useTranslation('loyalty');
      return <RecordTable.InlineHead icon={IconTag} label={t('title')} />;
    },
    cell: ({ cell }: { cell: any }) => {
      return (
        <VoucherNameCell
          voucher={cell.row.original}
          name={cell.getValue() as string}
        />
      );
    },
    size: 150,
  },
  {
    id: 'startDate',
    accessorKey: 'startDate',
    header: () => {
      const { t } = useTranslation('loyalty');
      return <RecordTable.InlineHead icon={IconCalendar} label={t('start-date')} />;
    },
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <SafeRelativeDate value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: () => {
      const { t } = useTranslation('loyalty');
      return <RecordTable.InlineHead icon={IconCalendarEvent} label={t('end-date')} />;
    },
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <SafeRelativeDate value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'voucherType',
    accessorKey: 'voucherType',
    header: () => {
      const { t } = useTranslation('loyalty');
      return <RecordTable.InlineHead icon={IconTicket} label={t('type')} />;
    },
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => {
      const { t } = useTranslation('loyalty');
      return <RecordTable.InlineHead icon={IconToggleLeft} label={t('status')} />;
    },
    cell: ({ cell }) => {
      const { _id } = cell.row.original || {};
      const currentStatus = cell.getValue() as string;
      const isActive = currentStatus === 'active';

      return (
        <RecordTableInlineCell>
          <Switch
            className="mx-auto"
            checked={isActive}
            onCheckedChange={() => {
              editStatus({
                variables: {
                  _id,
                  status: isActive ? 'inactive' : 'active',
                },
              });
            }}
          />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
];
