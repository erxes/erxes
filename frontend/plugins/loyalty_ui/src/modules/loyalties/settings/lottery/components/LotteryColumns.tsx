import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';

import {
  IconCalendar,
  IconCalendarEvent,
  IconHash,
  IconTag,
} from '@tabler/icons-react';
import type { TFunction } from 'i18next';
import { LotteryNameCell } from '../lottery-detail/components/LotteryNameCell';
import { ILottery } from '../types/lotteryTypes';
import { lotteryMoreColumn } from './LotteryMoreColumn';

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

export const lotteryColumns = (t: TFunction): ColumnDef<ILottery>[] => [
  lotteryMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<ILottery>,
  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('title')} />,
    cell: ({ cell }) => (
      <LotteryNameCell
        lottery={cell.row.original}
        name={cell.getValue() as string}
      />
    ),
    size: 150,
  },
  {
    id: 'startDate',
    accessorKey: 'startDate',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label={t('start-date')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
        <SafeRelativeDate value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'endDate',
    accessorKey: 'endDate',
    header: () => <RecordTable.InlineHead icon={IconCalendarEvent} label={t('end-date')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
        <SafeRelativeDate value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label={t('status')} icon={IconHash} />,
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <Badge
            variant={status === 'active' ? 'success' : 'secondary'}
            className="uppercase"
          >
            {status}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
];
