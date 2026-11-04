import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  IconAlertTriangle,
  IconHash,
  IconMessagePlus,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { CellContext, ColumnDef } from '@tanstack/react-table';
import {
  Alert,
  Badge,
  Button,
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { CompaniesInline } from 'ui-modules';
import { TeamInline } from '@/team/components/TeamInline';
import { useRemoveDiscordCustomerChannel } from '../hooks/useDiscordCommands';
import {
  IDiscordConfigSummary,
  IDiscordConnection,
  IDiscordCustomerChannel,
  TDiscordCustomerChannelRow,
} from '../types';
import {
  DiscordCustomerChannelSheet,
  TDiscordCustomerChannelDefaults,
} from './DiscordCustomerChannelSheet';
import { DiscordEmptyState } from './DiscordTableParts';

type TChannelCell = CellContext<TDiscordCustomerChannelRow, unknown>;

type TCustomerChannelActions = {
  edit: (channel: IDiscordCustomerChannel) => void;
  addForCompany: (channel: IDiscordCustomerChannel) => void;
  remove: (channel: IDiscordCustomerChannel) => void;
};

const CustomerChannelActionsContext =
  createContext<TCustomerChannelActions | null>(null);

const useCustomerChannelActions = () => {
  const actions = useContext(CustomerChannelActionsContext);

  if (!actions) {
    throw new Error(
      'Customer channel actions must be used inside DiscordCustomerChannelsTable.',
    );
  }

  return actions;
};

const ChannelActionsCell = ({ row }: TChannelCell) => {
  const actions = useCustomerChannelActions();
  const [open, setOpen] = useState(false);
  const channel = row.original;

  function run(action: (target: IDiscordCustomerChannel) => void) {
    setOpen(false);
    action(channel);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton
          className="h-full w-full"
          aria-label={`Actions for #${channel.channelName}`}
        />
      </Popover.Trigger>
      <Combobox.Content className="w-64">
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => run(actions.edit)}>
              <IconPencil />
              Edit
            </Command.Item>
            <Command.Item
              value="add"
              onSelect={() => run(actions.addForCompany)}
            >
              <IconMessagePlus />
              Link more channels for this company
            </Command.Item>
            <Command.Item
              value="remove"
              className="text-destructive"
              onSelect={() => run(actions.remove)}
            >
              <IconTrash />
              Unlink
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const ChannelNameCell = ({ row }: TChannelCell) => (
  <RecordTableInlineCell className="gap-1.5">
    <IconHash className="size-4 shrink-0 text-muted-foreground" />
    <span className="truncate font-medium">{row.original.channelName}</span>
  </RecordTableInlineCell>
);

const ChannelCompanyCell = ({ row }: TChannelCell) => (
  <RecordTableInlineCell>
    <CompaniesInline companyIds={[row.original.companyId]} />
  </RecordTableInlineCell>
);

const ChannelTeamCell = ({ row }: TChannelCell) => (
  <RecordTableInlineCell>
    <TeamInline teamId={row.original.teamId} />
  </RecordTableInlineCell>
);

const ChannelServerCell = ({ row }: TChannelCell) => {
  const { connection } = row.original;

  return (
    <RecordTableInlineCell className="gap-2">
      <span className="truncate">
        {connection?.guildName ?? 'Disconnected server'}
      </span>
      {connection && !connection.commandsRegisteredAt ? (
        <Badge variant="warning" className="shrink-0 text-xs">
          Commands off
        </Badge>
      ) : null}
    </RecordTableInlineCell>
  );
};

const channelColumns: ColumnDef<TDiscordCustomerChannelRow>[] = [
  {
    id: 'more',
    header: () => <RecordTable.ColumnSelector />,
    cell: ChannelActionsCell,
    size: 33,
  },
  {
    id: 'channel',
    accessorKey: 'channelName',
    header: () => <RecordTable.InlineHead label="Channel" />,
    cell: ChannelNameCell,
    size: 240,
  },
  {
    id: 'company',
    header: () => <RecordTable.InlineHead label="Company" />,
    cell: ChannelCompanyCell,
    size: 220,
  },
  {
    id: 'team',
    header: () => <RecordTable.InlineHead label="Team" />,
    cell: ChannelTeamCell,
    size: 200,
  },
  {
    id: 'server',
    header: () => <RecordTable.InlineHead label="Server" />,
    cell: ChannelServerCell,
    size: 240,
  },
];

const toRows = (
  customerChannels: IDiscordCustomerChannel[],
  connections: IDiscordConnection[],
): TDiscordCustomerChannelRow[] => {
  const connectionsById = new Map(
    connections.map((connection) => [connection._id, connection]),
  );

  return [...customerChannels]
    .sort(
      (a, b) =>
        a.companyId.localeCompare(b.companyId) ||
        a.channelName.localeCompare(b.channelName),
    )
    .map((channel) => ({
      ...channel,
      connection: connectionsById.get(channel.connectionId),
    }));
};

export function DiscordCustomerChannelsTable({
  connections,
  configs,
  customerChannels,
  loading,
  failed,
}: Readonly<{
  connections: IDiscordConnection[];
  configs: IDiscordConfigSummary[];
  customerChannels: IDiscordCustomerChannel[];
  loading: boolean;
  failed: boolean;
}>) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [current, setCurrent] = useState<IDiscordCustomerChannel | null>(null);
  const [defaults, setDefaults] = useState<TDiscordCustomerChannelDefaults>({});

  const { removeCustomerChannel } = useRemoveDiscordCustomerChannel({
    onCompleted: () => toast({ title: 'Customer channel unlinked' }),
    onError: (removeError) =>
      toast({
        title: 'Could not unlink the customer channel',
        description: removeError.message,
        variant: 'destructive',
      }),
  });

  const rows = useMemo(
    () => toRows(customerChannels, connections),
    [connections, customerChannels],
  );
  const serversWithoutCommands = [
    ...new Set(
      rows
        .map((row) => row.connection)
        .filter(
          (connection): connection is IDiscordConnection =>
            Boolean(connection) && !connection?.commandsRegisteredAt,
        )
        .map((connection) => connection.guildName),
    ),
  ];

  const openSheet = useCallback(
    (
      channel: IDiscordCustomerChannel | null,
      nextDefaults: TDiscordCustomerChannelDefaults = {},
    ) => {
      setCurrent(channel);
      setDefaults(nextDefaults);
      setSheetOpen(true);
    },
    [],
  );

  const actions = useMemo<TCustomerChannelActions>(
    () => ({
      edit: (channel) => openSheet(channel),
      addForCompany: (channel) =>
        openSheet(null, {
          companyId: channel.companyId,
          teamId: channel.teamId,
        }),
      remove: (channel) =>
        confirm({
          message: `Unlink #${channel.channelName}? /triage new and /tasks stop working there, and new updates are no longer posted to it.`,
        }).then(() =>
          removeCustomerChannel({ variables: { _id: channel._id } }),
        ),
    }),
    [confirm, openSheet, removeCustomerChannel],
  );

  const linkButton = (
    <Button onClick={() => openSheet(null)} disabled={!connections.length}>
      <IconPlus />
      Link channels
    </Button>
  );

  function renderTable() {
    if (failed) {
      return (
        <Alert variant="destructive">
          <IconAlertTriangle className="size-4" />
          <Alert.Description>
            Failed to load the customer channels. Please refresh.
          </Alert.Description>
        </Alert>
      );
    }

    if (!loading && !rows.length) {
      return (
        <DiscordEmptyState
          icon={<IconHash />}
          title="No customer channels yet"
          description={
            connections.length
              ? 'Link a company’s channels so its people can report issues with /triage new and follow their tasks with /tasks.'
              : 'Add a Discord bot first, then link the company channels it can see.'
          }
          action={connections.length ? linkButton : undefined}
        />
      );
    }

    return (
      <RecordTable.Provider
        columns={channelColumns}
        data={rows}
        tableId="operation_discord_customer_channels_record_table"
        stickyColumns={['more', 'channel']}
        className="h-full"
      >
        <RecordTable.Scroll>
          <RecordTable className="w-full">
            <RecordTable.Header />
            <RecordTable.Body>
              {loading && !rows.length ? (
                <RecordTable.RowSkeleton rows={5} />
              ) : null}
              <RecordTable.RowList />
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    );
  }

  return (
    <CustomerChannelActionsContext.Provider value={actions}>
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <p className="max-w-2xl text-sm text-muted-foreground">
            People in these company channels report issues with /triage new and
            follow their tasks with /tasks. Updates are posted back to the
            channel a report came from.
          </p>
          {rows.length ? linkButton : null}
        </div>

        {serversWithoutCommands.length ? (
          <Alert variant="warning">
            <IconAlertTriangle className="size-4" />
            <Alert.Title>
              Slash commands are off on {serversWithoutCommands.join(', ')}
            </Alert.Title>
            <Alert.Description>
              /triage new and /tasks do not appear in these channels yet. Turn
              them on from the server’s ⋯ menu in Servers.
            </Alert.Description>
          </Alert>
        ) : null}

        <div className="flex min-h-0 flex-1 flex-col">{renderTable()}</div>
      </div>

      <DiscordCustomerChannelSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        connections={connections}
        configs={configs}
        customerChannels={customerChannels}
        current={current}
        defaults={defaults}
      />
    </CustomerChannelActionsContext.Provider>
  );
}
