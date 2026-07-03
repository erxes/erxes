import {
  IconTag,
  IconUser,
  IconToggleLeft,
  IconCalendar,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import type { TFunction } from 'i18next';
import { IAssignmentItem } from '../types/assignment';

const statusVariant = (status?: string) => {
  if (status === 'won') return 'success';
  if (status === 'loss') return 'destructive';
  return 'secondary';
};

const SafeRelativeDate = ({ value }: { value?: string }) => {
  if (!value) return <span className="text-muted-foreground">—</span>;
  try {
    const parsed = /^\d+$/.test(value)
      ? new Date(Number(value))
      : new Date(value);
    if (Number.isNaN(parsed.getTime()))
      return <span className="text-muted-foreground">—</span>;
    const iso = parsed.toISOString();
    return (
      <RelativeDateDisplay value={iso} asChild>
        <RelativeDateDisplay.Value value={iso} />
      </RelativeDateDisplay>
    );
  } catch {
    return <span className="text-muted-foreground">—</span>;
  }
};

export const assignmentColumns = (t: TFunction): ColumnDef<IAssignmentItem>[] => [
  RecordTable.checkboxColumn as ColumnDef<IAssignmentItem>,
  {
    id: 'campaign',
    accessorKey: 'campaign',
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('campaign')} />,
    size: 180,
    cell: ({ row }) => (
      <RecordTableInlineCell className="text-xs text-muted-foreground">
        {row.original.campaign?.title || '—'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'ownerId',
    accessorKey: 'ownerId',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('owner-id')} />,
    size: 180,
    cell: ({ row }) => (
      <RecordTableInlineCell className="text-xs">
        {row.original.ownerId || '—'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconToggleLeft} label={t('status')} />,
    size: 100,
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <Badge variant={statusVariant(status)} className="capitalize">
            {status || '—'}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead icon={IconCalendar} label={t('created-at')} />,
    size: 150,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-xs text-muted-foreground">
        <SafeRelativeDate value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
];
