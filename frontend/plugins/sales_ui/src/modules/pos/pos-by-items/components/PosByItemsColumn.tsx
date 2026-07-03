import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconMobiledata,
  IconCategory,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
} from 'erxes-ui';
import { IPosByItems } from '@/pos/pos-by-items/types/PosByItemType';

import type { TFunction } from 'i18next';

const getHourCount = (
  counts: Record<string, number> | undefined,
  hours: number[],
): string => {
  if (!counts) return '';
  const total = hours.reduce((sum, h) => sum + (counts[String(h)] || 0), 0);
  return total === 0 ? '' : String(total);
};

const BEFORE_10_HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const AFTER_21_HOURS = [22, 23];

export const PosByItemsColumns = (t: TFunction): ColumnDef<IPosByItems>[] => [
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('code')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 100,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconLabel} label={t('name')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'category',
    header: () => (
      <RecordTable.InlineHead icon={IconCategory} label={t('category')} />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={row.original.category?.name || ''} />
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'unitPrice',
    accessorKey: 'unitPrice',
    header: () => (
      <RecordTable.InlineHead icon={IconMobiledata} label={t('unit-price')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={
            (cell.getValue() as number) != null
              ? (cell.getValue() as number).toLocaleString()
              : '0'
          }
        />
      </RecordTableInlineCell>
    ),
    size: 100,
  },
  {
    id: 'count_before_10',
    header: () => <RecordTable.InlineHead label="<10" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={getHourCount(row.original.counts, BEFORE_10_HOURS)}
        />
      </RecordTableInlineCell>
    ),
    size: 50,
  },
  ...([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21] as const).map(
    (hour) =>
      ({
        id: `count_${hour}`,
        header: () => <RecordTable.InlineHead label={String(hour)} />,
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <TextOverflowTooltip
              value={getHourCount(row.original.counts, [hour])}
            />
          </RecordTableInlineCell>
        ),
        size: 50,
      }) satisfies ColumnDef<IPosByItems>,
  ),
  {
    id: 'count_after_21',
    header: () => <RecordTable.InlineHead label="21<" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={getHourCount(row.original.counts, AFTER_21_HOURS)}
        />
      </RecordTableInlineCell>
    ),
    size: 50,
  },
  {
    id: 'count',
    accessorKey: 'count',
    header: () => (
      <RecordTable.InlineHead icon={IconChartBar} label={t('pos-sale')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={
            (cell.getValue() as number) != null
              ? (cell.getValue() as number).toLocaleString()
              : '0'
          }
        />
      </RecordTableInlineCell>
    ),
    size: 100,
  },
  {
    id: 'amount',
    accessorKey: 'amount',
    header: () => (
      <RecordTable.InlineHead icon={IconBuilding} label={t('pos-amount')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={
            (cell.getValue() as number) != null
              ? (cell.getValue() as number).toLocaleString()
              : '0'
          }
        />
      </RecordTableInlineCell>
    ),
    size: 100,
  },
];
