import { IOAuthClientApp } from '@/settings/oauth-clients/types';
import { ColumnDef } from '@tanstack/table-core';
import { format } from 'date-fns';
import { Badge, RecordTableInlineCell, useToast } from 'erxes-ui';
import { IconCopy } from '@tabler/icons-react';
import { useState } from 'react';

const ClientIdCell = ({ clientId }: { clientId: string }) => {
  const [hovered, setHovered] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(clientId);
    toast({ variant: 'success', title: 'Client ID copied to clipboard' });
  };

  return (
    <RecordTableInlineCell>
      <div
        className="flex items-center gap-1 group"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <span className="font-mono text-xs">{clientId}</span>
        {hovered && (
          <button
            onClick={handleCopy}
            className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Copy client ID"
          >
            <IconCopy size={14} />
          </button>
        )}
      </div>
    </RecordTableInlineCell>
  );
};

export const oauthClientsSettingsColumns: ColumnDef<IOAuthClientApp>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
  },
  {
    id: 'clientId',
    accessorKey: 'clientId',
    header: 'Client ID',
    cell: ({ cell }) => <ClientIdCell clientId={cell.getValue() as string} />,
  },
  {
    id: 'type',
    accessorKey: 'type',
    header: 'Type',
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="secondary">{cell.getValue() as string}</Badge>
      </RecordTableInlineCell>
    ),
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
    header: 'Created',
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {format(new Date(cell.getValue() as string), 'yyyy/MM/dd')}
      </RecordTableInlineCell>
    ),
  },
];
