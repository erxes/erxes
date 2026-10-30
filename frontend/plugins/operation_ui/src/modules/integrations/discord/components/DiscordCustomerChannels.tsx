import { useState } from 'react';
import {
  IconAlertTriangle,
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

const GRID_COLUMNS =
  'grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_2rem] items-center gap-3';

function CustomerChannelRow({
  channel,
  connection,
  onEdit,
  onRemove,
  removing,
}: {
  channel: IDiscordCustomerChannel;
  connection?: IDiscordConnection;
  onEdit: () => void;
  onRemove: () => void;
  removing: boolean;
}) {
  return (
    <div className={`${GRID_COLUMNS} px-3 py-2.5`}>
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-muted-foreground">
          <IconHash className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">{channel.channelName}</p>
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
        <CompaniesInline companyIds={[channel.companyId]} />
      </div>
      <div className="min-w-0 truncate text-sm">
        <TeamInline teamId={channel.teamId} />
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

export function DiscordCustomerChannels({
  connections,
  configs,
}: {
  connections: IDiscordConnection[];
  configs: IDiscordConfigSummary[];
}) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { customerChannels, loading, error } = useDiscordCustomerChannels();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [current, setCurrent] = useState<IDiscordCustomerChannel | null>(null);

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

  function openDialog(channel: IDiscordCustomerChannel | null) {
    setCurrent(channel);
    setDialogOpen(true);
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
              new and follow their tasks with /tasks. Updates on what they
              report are posted back to the same channel.
            </Card.Description>
          </div>
          {customerChannels.length ? (
            <Button
              size="sm"
              className="shrink-0"
              onClick={() => openDialog(null)}
              disabled={!connections.length}
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

          {loading && !customerChannels.length ? (
            <div className="space-y-2">
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <Alert.Description>
                Failed to load the customer channels. Please refresh.
              </Alert.Description>
            </Alert>
          ) : customerChannels.length === 0 ? (
            <Empty className="border border-dashed border-border py-8">
              <Empty.Header>
                <Empty.Media variant="icon">
                  <IconBrandDiscord />
                </Empty.Media>
                <Empty.Title>No customer channels yet</Empty.Title>
                <Empty.Description>
                  {connections.length
                    ? 'Link a company’s channel so its people can report issues and see their tasks without leaving Discord.'
                    : 'Connect a Discord server above, then link each company’s channel here.'}
                </Empty.Description>
              </Empty.Header>
              {connections.length ? (
                <Empty.Content>
                  <Button size="sm" onClick={() => openDialog(null)}>
                    <IconPlus className="size-4" />
                    Link a channel
                  </Button>
                </Empty.Content>
              ) : null}
            </Empty>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              <div
                className={`${GRID_COLUMNS} border-b border-border bg-accent/40 px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground`}
              >
                <span>Channel</span>
                <span>Company</span>
                <span>Receives triages</span>
                <span />
              </div>
              <div className="divide-y divide-border">
                {customerChannels.map((channel) => (
                  <CustomerChannelRow
                    key={channel._id}
                    channel={channel}
                    connection={connectionsById.get(channel.connectionId)}
                    onEdit={() => openDialog(channel)}
                    onRemove={() => handleRemove(channel)}
                    removing={removing}
                  />
                ))}
              </div>
            </div>
          )}
        </Card.Content>
      </Card>

      <DiscordCustomerChannelDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        connections={connections}
        configs={configs}
        customerChannels={customerChannels}
        current={current}
      />
    </>
  );
}
