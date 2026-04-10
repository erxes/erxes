import {
  IconTag,
  IconHash,
  IconToggleLeft,
  IconCalendar,
  IconChartBar,
  IconLock,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  useToast,
} from 'erxes-ui';
import { ICoupon } from '../types/coupon';

const CodeCell = ({ code }: { code?: string }) => {
  const { toast } = useToast();

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: code, variant: 'default' });
  };

  return (
    <RecordTableInlineCell
      className="text-xs font-mono font-medium text-blue-600 cursor-pointer hover:underline"
      onClick={handleCopy}
    >
      {code || '—'}
    </RecordTableInlineCell>
  );
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

const statusVariant = (status?: string) => {
  if (status === 'new') return 'success';
  if (status === 'in_use') return 'default';
  return 'secondary';
};

export const couponColumns: ColumnDef<ICoupon>[] = [
  {
    id: 'campaignId',
    accessorKey: 'campaign',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Campaign" />,
    size: 160,
    cell: ({ row }) => (
      <RecordTableInlineCell className="text-xs text-muted-foreground">
        {row.original.campaign?.title || '—'}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Code" />,
    size: 140,
    cell: ({ row }) => <CodeCell code={row.original.code} />,
  },
  {
    id: 'usageCount',
    accessorKey: 'usageCount',
    header: () => <RecordTable.InlineHead icon={IconChartBar} label="Usage" />,
    size: 90,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.getValue() == null ? '0' : String(cell.getValue())}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'usageLimit',
    accessorKey: 'usageLimit',
    header: () => <RecordTable.InlineHead icon={IconLock} label="Limit" />,
    size: 90,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {cell.getValue() == null ? '—' : String(cell.getValue())}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconToggleLeft} label="Status" />
    ),
    size: 100,
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <Badge variant={statusVariant(status)} className="capitalize">
            {status?.replace('_', ' ') || '—'}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Created At" />
    ),
    size: 150,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="text-xs text-muted-foreground">
        <SafeRelativeDate value={cell.getValue() as string} />
      </RecordTableInlineCell>
    ),
  },
];
