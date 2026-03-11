import { IApp } from '@/settings/apps/types';
import { ColumnDef } from '@tanstack/table-core';
import { format } from 'date-fns';
import { Badge, RecordTableInlineCell, useToast } from 'erxes-ui';
import { IconCopy } from '@tabler/icons-react';
import { useState } from 'react';

const TokenCell = ({ token }: { token: string }) => {
  const [hovered, setHovered] = useState(false);
  const { toast } = useToast();
  const masked = token.slice(0, 6) + '••••••••••••••••••••';

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    toast({ variant: 'success', title: 'Token copied to clipboard' });
  };

  return (
    <RecordTableInlineCell>
      <div
        className="flex items-center gap-1 group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="font-mono text-xs">{masked}</span>
        {hovered && (
          <button
            onClick={handleCopy}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Copy token"
          >
            <IconCopy size={14} />
          </button>
        )}
      </div>
    </RecordTableInlineCell>
  );
};

export const appsSettingsColumns: ColumnDef<IApp>[] = [
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
