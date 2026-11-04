import { IconAlertTriangle, IconBrandDiscord } from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import { Alert, Avatar, RecordTable, RecordTableInlineCell } from 'erxes-ui';
import type { ReactNode } from 'react';
import { formatDiscordDate, getCommandsStatus } from '../utils/discordStatus';
import { TDiscordServerRow } from '../types';
import { DiscordServerActions } from './DiscordServerActions';
import { DiscordEmptyState, DiscordStatusCell } from './DiscordTableParts';

type TServerCell = CellContext<TDiscordServerRow, unknown>;

const COMMANDS_BADGE = {
  on: { label: 'On', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
  off: { label: 'Off', variant: 'secondary' },
} as const;

const ServerActionsCell = ({ row }: TServerCell) => (
  <DiscordServerActions server={row.original} />
);

const ServerNameCell = ({ row }: TServerCell) => (
  <RecordTableInlineCell className="gap-2">
    <Avatar>
      <Avatar.Image
        src={row.original.guildIconUrl ?? undefined}
        alt={row.original.guildName}
      />
      <Avatar.Fallback>
        {row.original.guildName[0]?.toUpperCase()}
      </Avatar.Fallback>
    </Avatar>
    <span className="truncate font-medium">{row.original.guildName}</span>
  </RecordTableInlineCell>
);

const ServerBotCell = ({ row }: TServerCell) => (
  <RecordTableInlineCell>
    <span className="truncate">{row.original.botUsername}</span>
  </RecordTableInlineCell>
);

const ServerHealthCell = ({ row }: TServerCell) =>
  row.original.health?.status === 'broken' ? (
    <DiscordStatusCell
      variant="destructive"
      label="Token broken"
      tooltip={row.original.health.lastError}
    />
  ) : (
    <DiscordStatusCell variant="success" label="Active" />
  );

const ServerCommandsCell = ({ row }: TServerCell) => {
  const status = getCommandsStatus(row.original);

  return (
    <DiscordStatusCell
      variant={COMMANDS_BADGE[status].variant}
      label={COMMANDS_BADGE[status].label}
      tooltip={status === 'failed' ? row.original.commandsError : undefined}
    />
  );
};

const ServerTeamsCell = ({ row }: TServerCell) => (
  <RecordTableInlineCell>{row.original.teamCount}</RecordTableInlineCell>
);

const ServerCustomerChannelsCell = ({ row }: TServerCell) => (
  <RecordTableInlineCell>
    {row.original.customerChannelCount}
  </RecordTableInlineCell>
);

const ServerConnectedCell = ({ row }: TServerCell) => (
  <RecordTableInlineCell className="text-muted-foreground">
    {formatDiscordDate(row.original.createdAt)}
  </RecordTableInlineCell>
);

const serverColumns: ColumnDef<TDiscordServerRow>[] = [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ServerActionsCell,
    size: 33,
  },
  {
    id: 'server',
    accessorKey: 'guildName',
    header: () => <RecordTable.InlineHead label="Server" />,
    cell: ServerNameCell,
    size: 240,
  },
  {
    id: 'bot',
    accessorKey: 'botUsername',
    header: () => <RecordTable.InlineHead label="Bot" />,
    cell: ServerBotCell,
    size: 180,
  },
  {
    id: 'health',
    header: () => <RecordTable.InlineHead label="Status" />,
    cell: ServerHealthCell,
    size: 130,
  },
  {
    id: 'commands',
    header: () => <RecordTable.InlineHead label="Slash commands" />,
    cell: ServerCommandsCell,
    size: 140,
  },
  {
    id: 'teams',
    accessorKey: 'teamCount',
    header: () => <RecordTable.InlineHead label="Teams" />,
    cell: ServerTeamsCell,
    size: 100,
  },
  {
    id: 'customerChannels',
    accessorKey: 'customerChannelCount',
    header: () => <RecordTable.InlineHead label="Customer channels" />,
    cell: ServerCustomerChannelsCell,
    size: 160,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead label="Connected" />,
    cell: ServerConnectedCell,
    size: 140,
  },
];

export function DiscordServersTable({
  servers,
  loading,
  failed,
  addAction,
}: Readonly<{
  servers: TDiscordServerRow[];
  loading: boolean;
  failed: boolean;
  addAction: ReactNode;
}>) {
  if (failed) {
    return (
      <Alert variant="destructive">
        <IconAlertTriangle className="size-4" />
        <Alert.Description>
          Failed to load Discord servers. Please refresh.
        </Alert.Description>
      </Alert>
    );
  }

  if (!loading && !servers.length) {
    return (
      <DiscordEmptyState
        icon={<IconBrandDiscord />}
        title="No Discord servers yet"
        description="Add a Discord bot to post triage and task updates to its server."
        action={addAction}
      />
    );
  }

  return (
    <RecordTable.Provider
      columns={serverColumns}
      data={servers}
      tableId="operation_discord_servers_record_table"
      stickyColumns={['more', 'server']}
      className="h-full"
    >
      <RecordTable.Scroll>
        <RecordTable className="w-full">
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && !servers.length ? (
              <RecordTable.RowSkeleton rows={3} />
            ) : null}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
}
