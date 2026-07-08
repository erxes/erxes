import { IApp } from '@/settings/apps/types';
import { ColumnDef } from '@tanstack/table-core';
import { format } from 'date-fns';
import {
  Badge,
  Button,
  RecordTable,
  RecordTableInlineCell,
  useToast,
} from 'erxes-ui';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';

const TokenCell = ({ token }: { token: string }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const masked = token.slice(0, 6) + '••••••••••••••••••••';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast({ variant: 'success', title: 'Token copied to clipboard' });
      setTimeout(() => setCopied(false), 1000);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to copy token' });
    }
  };

  return (
    <RecordTableInlineCell
      className="group justify-between"
      onClick={handleCopy}
    >
      <span className="font-mono text-xs">{masked}</span>
      <Button variant="ghost" size="icon" className="hidden group-hover:flex">
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </Button>
    </RecordTableInlineCell>
  );
};

export const appsSettingsColumns: ColumnDef<IApp>[] = [
  { ...RecordTable.checkboxColumn, size: 20 } as ColumnDef<IApp>,
  {
    id: 'name',
    accessorKey: 'name',
    header: 'App Name',
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'token',
    accessorKey: 'token',
    header: 'Token',
    cell: ({ cell }) => <TokenCell token={cell.getValue() as string} />,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {format(new Date(cell.getValue() as string), 'yyyy/MM/dd') ||
          'YYYY/MM/DD'}
      </RecordTableInlineCell>
    ),
  },
];
