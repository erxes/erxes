import {
  IconCalendar,
  IconCalendarEvent,
  IconHash,
  IconToggleLeft,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell } from 'erxes-ui';
import { TFunction } from 'i18next';
import { SafeRelativeDate } from './SafeRelativeDate';
import { LoyaltyStatusBadgeCell } from './LoyaltyStatusBadgeCell';
import { LoyaltyStatusSwitchCell } from './LoyaltyStatusSwitchCell';

export const settingsStartDateColumn = <TData,>(
  t: TFunction<'loyalty'>,
): ColumnDef<TData> => ({
  id: 'startDate',
  accessorKey: 'startDate',
  header: () => (
    <RecordTable.InlineHead icon={IconCalendar} label={t('start-date')} />
  ),
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
        <SafeRelativeDate value={cell.getValue() as string} fallback="-" />
      </RecordTableInlineCell>
    );
  },
  size: 150,
});

export const settingsEndDateColumn = <TData,>(
  t: TFunction<'loyalty'>,
): ColumnDef<TData> => ({
  id: 'endDate',
  accessorKey: 'endDate',
  header: () => (
    <RecordTable.InlineHead icon={IconCalendarEvent} label={t('end-date')} />
  ),
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
        <SafeRelativeDate value={cell.getValue() as string} fallback="-" />
      </RecordTableInlineCell>
    );
  },
  size: 150,
});

export const settingsStatusBadgeColumn = <TData,>(
  t: TFunction<'loyalty'>,
): ColumnDef<TData> => ({
  id: 'status',
  accessorKey: 'status',
  header: () => <RecordTable.InlineHead label={t('status')} icon={IconHash} />,
  cell: ({ cell }) => {
    const status = cell.getValue() as string;
    return <LoyaltyStatusBadgeCell status={status} />;
  },
  size: 150,
});

export const settingsStatusSwitchColumn = <TData extends { _id: string }>(
  t: TFunction<'loyalty'>,
  onStatusChange: (_id: string, status: string) => void,
): ColumnDef<TData> => ({
  id: 'status',
  accessorKey: 'status',
  header: () => (
    <RecordTable.InlineHead icon={IconToggleLeft} label={t('status')} />
  ),
  cell: ({ cell }) => {
    const { _id } = cell.row.original;
    const currentStatus = cell.getValue() as string;
    const isActive = currentStatus === 'active';

    return (
      <LoyaltyStatusSwitchCell
        checked={isActive}
        onToggle={() => onStatusChange(_id, isActive ? 'inactive' : 'active')}
      />
    );
  },
  size: 100,
});
