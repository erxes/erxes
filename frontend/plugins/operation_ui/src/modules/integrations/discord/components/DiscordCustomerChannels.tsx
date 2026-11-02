import { useState } from 'react';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconBrandDiscord,
  IconDotsVertical,
  IconHash,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Collapsible,
  DropdownMenu,
  Empty,
  Skeleton,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { CompaniesInline } from 'ui-modules';
import { TeamInline } from '@/team/components/TeamInline';
import {
  useDiscordCustomerChannels,
  useRemoveDiscordCustomerChannel,
} from '../hooks/useDiscordCommands';
import {
  IDiscordConfigSummary,
  IDiscordConnection,
  IDiscordCustomerChannel,
} from '../types';
import { DiscordCustomerChannelDialog } from './DiscordCustomerChannelDialog';

type TCompanyChannelGroup = {
  companyId: string;
  channels: IDiscordCustomerChannel[];
  teamCount: number;
};

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

const groupByCompany = (
  channels: IDiscordCustomerChannel[],
): TCompanyChannelGroup[] => {
  const groups = new Map<string, IDiscordCustomerChannel[]>();

  for (const channel of channels) {
    groups.set(channel.companyId, [
      ...(groups.get(channel.companyId) ?? []),
      channel,
    ]);
  }

  return [...groups].map(([companyId, items]) => ({
    companyId,
    channels: [...items].sort((a, b) =>
      a.channelName.localeCompare(b.channelName),
    ),
    teamCount: new Set(items.map((item) => item.teamId)).size,
  }));
};

function CustomerChannelRow({
  channel,
  connection,
  onEdit,
  onRemove,
  removing,
}: Readonly<{
  channel: IDiscordCustomerChannel;
  connection?: IDiscordConnection;
  onEdit: () => void;
  onRemove: () => void;
  removing: boolean;
}>) {
  return (
    <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_2rem] items-center gap-3 px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-muted-foreground">
          <IconHash className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{channel.channelName}</p>
          <div className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            <span className="truncate">
              {connection?.guildName ?? 'Disconnected server'}
            </span>
            {connection && !connection.commandsRegisteredAt ? (
              <Badge variant="warning" className="shrink-0">
                Commands off
              </Badge>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <IconArrowRight
          className="size-4 shrink-0 text-muted-foreground"
          aria-label="Sends triages to"
        />
        <span className="min-w-0 truncate">
          <TeamInline teamId={channel.teamId} />
        </span>
      </div>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Actions for #${channel.channelName}`}
            disabled={removing}
          >
            <IconDotsVertical className="size-4" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end" className="w-40 min-w-0">
          <DropdownMenu.Item className="cursor-pointer" onSelect={onEdit}>
            <IconPencil className="size-4" />
            Edit
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="cursor-pointer text-destructive"
            onSelect={onRemove}
          >
            <IconTrash className="size-4" />
            Unlink
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}

function CompanyChannelGroup({
  group,
  connectionsById,
  onAdd,
  onEdit,
  onRemove,
  removing,
}: Readonly<{
  group: TCompanyChannelGroup;
  connectionsById: Map<string, IDiscordConnection>;
  onAdd: () => void;
  onEdit: (channel: IDiscordCustomerChannel) => void;
  onRemove: (channel: IDiscordCustomerChannel) => void;
  removing: boolean;
}>) {
  const summary = [
    pluralize(group.channels.length, 'channel'),
    group.teamCount > 1 ? pluralize(group.teamCount, 'team') : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Collapsible
      defaultOpen
      className="overflow-hidden rounded-lg border border-border"
    >
      <div className="flex items-center justify-between gap-3 bg-accent/40 px-2 py-1.5">
        <Collapsible.TriggerButton className="w-auto min-w-0 gap-2 px-1 font-medium">
          <Collapsible.TriggerIcon className="size-3 shrink-0" />
          <CompaniesInline companyIds={[group.companyId]} />
        </Collapsible.TriggerButton>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs text-muted-foreground">{summary}</span>
          <Button size="sm" variant="ghost" onClick={onAdd}>
            <IconPlus className="size-4" />
            Add channel
          </Button>
        </div>
      </div>
      <Collapsible.Content>
        <div className="divide-y divide-border border-t border-border">
          {group.channels.map((channel) => (
            <CustomerChannelRow
              key={channel._id}
              channel={channel}
              connection={connectionsById.get(channel.connectionId)}
              onEdit={() => onEdit(channel)}
              onRemove={() => onRemove(channel)}
              removing={removing}
            />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
}

export function DiscordCustomerChannels({
  connections,
  configs,
}: Readonly<{
  connections: IDiscordConnection[];
  configs: IDiscordConfigSummary[];
}>) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { customerChannels, loading, error } = useDiscordCustomerChannels();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<IDiscordCustomerChannel | null>(null);
  const [defaultCompanyId, setDefaultCompanyId] = useState('');

  const { removeCustomerChannel, removing } = useRemoveDiscordCustomerChannel({
    onCompleted: () => toast({ title: 'Customer channel unlinked' }),
    onError: (removeError) =>
      toast({
        title: 'Could not unlink the customer channel',
        description: removeError.message,
        variant: 'destructive',
      }),
  });

  const connectionsById = new Map(
    connections.map((connection) => [connection._id, connection]),
  );
  const groups = groupByCompany(customerChannels);
  const serversWithoutCommands = [
    ...new Set(
      customerChannels
        .map((channel) => connectionsById.get(channel.connectionId))
        .filter(
          (connection): connection is IDiscordConnection =>
            Boolean(connection) && !connection?.commandsRegisteredAt,
        )
        .map((connection) => connection.guildName),
    ),
  ];

  function openDialog(channel: IDiscordCustomerChannel | null, companyId = '') {
    setCurrent(channel);
    setDefaultCompanyId(companyId);
    setDialogOpen(true);
  }

  function renderChannels() {
    if (loading && !customerChannels.length) {
      return (
        <div className="space-y-2">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-12 w-full" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <Alert.Description>
            Failed to load the customer channels. Please refresh.
          </Alert.Description>
        </Alert>
      );
    }

    if (!customerChannels.length) {
      return (
        <Empty className="border border-dashed border-border py-8">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconBrandDiscord />
            </Empty.Media>
            <Empty.Title>No customer channels yet</Empty.Title>
            <Empty.Description>
              Link a company’s channels so its people can report issues and see
              their tasks without leaving Discord.
            </Empty.Description>
          </Empty.Header>
          <Empty.Content>
            <Button size="sm" onClick={() => openDialog(null)}>
              <IconPlus className="size-4" />
              Link channels
            </Button>
          </Empty.Content>
        </Empty>
      );
    }

    return (
      <div className="space-y-2">
        {groups.map((group) => (
          <CompanyChannelGroup
            key={group.companyId}
            group={group}
            connectionsById={connectionsById}
            onAdd={() => openDialog(null, group.companyId)}
            onEdit={(channel) => openDialog(channel)}
            onRemove={handleRemove}
            removing={removing}
          />
        ))}
      </div>
    );
  }

  function handleRemove(channel: IDiscordCustomerChannel) {
    confirm({
      message: `Unlink #${channel.channelName}? /triage new and /tasks stop working there, and new updates are no longer posted to it.`,
    }).then(() => {
      removeCustomerChannel({ variables: { _id: channel._id } });
    });
  }

  return (
    <>
      <Card>
        <Card.Header className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Card.Title>Customer channels</Card.Title>
              {customerChannels.length ? (
                <Badge variant="secondary">{customerChannels.length}</Badge>
              ) : null}
            </div>
            <Card.Description>
              Company Discord channels where people report issues with /triage
              new and follow their tasks with /tasks. Each channel sends its
              reports to its own team, and updates are posted back to the
              channel they came from.
            </Card.Description>
          </div>
          {customerChannels.length ? (
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => openDialog(null)}
            >
              <IconPlus className="size-4" />
              Link channel
            </Button>
          ) : null}
        </Card.Header>
        <Card.Content className="space-y-3">
          {serversWithoutCommands.length ? (
            <Alert variant="warning">
              <IconAlertTriangle />
              <Alert.Title>
                Slash commands are off on {serversWithoutCommands.join(', ')}
              </Alert.Title>
              <Alert.Description>
                /triage new and /tasks do not appear in these channels yet. Turn
                them on from the server card above.
              </Alert.Description>
            </Alert>
          ) : null}

          {renderChannels()}
        </Card.Content>
      </Card>

      <DiscordCustomerChannelDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        connections={connections}
        configs={configs}
        customerChannels={customerChannels}
        current={current}
        defaultCompanyId={defaultCompanyId}
      />
    </>
  );
}
