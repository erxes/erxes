import {
  IOAuthClientApp,
  OAUTH_CLIENT_ACCESS_TOKEN_LIFETIME_OPTIONS,
  OAuthClientAccessTokenLifetime,
} from '@/settings/oauth-clients/types';
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

const ClientIdCell = ({ clientId }: { clientId: string }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clientId);
      setCopied(true);
      toast({ variant: 'success', title: 'Client ID copied to clipboard' });
      setTimeout(() => setCopied(false), 1000);
    } catch {
      toast({ variant: 'destructive', title: 'Failed to copy client ID' });
    }
  };

  return (
    <RecordTableInlineCell
      className="group justify-between"
      onClick={handleCopy}
    >
      <span className="font-mono text-xs">{clientId}</span>
      <Button size="icon" variant="ghost" className="group-hover:block hidden">
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </Button>
    </RecordTableInlineCell>
  );
};

const getAccessTokenLifetimeLabel = (
  value?: OAuthClientAccessTokenLifetime,
) => {
  return OAUTH_CLIENT_ACCESS_TOKEN_LIFETIME_OPTIONS.find(
    (option) => option.value === value,
  )?.label;
};

export const oauthClientsSettingsColumns: ColumnDef<IOAuthClientApp>[] = [
  { ...RecordTable.checkboxColumn, size: 33 } as ColumnDef<IOAuthClientApp>,
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
    id: 'accessTokenLifetime',
    accessorKey: 'accessTokenLifetime',
    header: 'Token lifetime',
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {row.original.type === 'confidential'
          ? getAccessTokenLifetimeLabel(row.original.accessTokenLifetime) ||
            '1 year'
          : '-'}
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
