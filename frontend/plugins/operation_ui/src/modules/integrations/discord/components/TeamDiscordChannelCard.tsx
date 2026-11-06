import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { DISCORD_EVENT_OPTIONS } from '../constants';
import {
  useRemoveDiscordTeamConfig,
  useSendDiscordTestMessage,
} from '../hooks/useDiscordIntegration';
import { IDiscordConfig, IDiscordConnection } from '../types';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

function TeamDiscordDeliveryAlert({
  config,
  connection,
}: Readonly<{
  config: IDiscordConfig;
  connection: IDiscordConnection;
}>) {
  if (connection.health?.status === 'broken') {
    return (
      <Alert variant="destructive">
        <Alert.Title>
          The connection to {connection.guildName} stopped working
        </Alert.Title>
        <Alert.Description>
          {connection.health.lastError ||
            'Update the bot in Discord Integration settings.'}
        </Alert.Description>
      </Alert>
    );
  }

  if (config.lastError) {
    return (
      <Alert variant="warning">
        <Alert.Description>
          The last message failed: {config.lastError}
        </Alert.Description>
      </Alert>
    );
  }

  return null;
}

function TeamDiscordEventBadges({
  config,
}: Readonly<{ config: IDiscordConfig }>) {
  return (
    <div className="flex flex-wrap gap-2">
      {DISCORD_EVENT_OPTIONS.filter((option) =>
        config.events.includes(option.value),
      ).map((option) => (
        <Badge key={option.value} variant="secondary">
          {config.mention !== 'none' &&
          config.mentionEvents.includes(option.value)
            ? `${option.label} · @${config.mention}`
            : option.label}
        </Badge>
      ))}
    </div>
  );
}

export function TeamDiscordChannelCard({
  teamId,
  config,
  connection,
  onEdit,
  onRefresh,
}: Readonly<{
  teamId: string;
  config: IDiscordConfig;
  connection?: IDiscordConnection;
  onEdit: () => void;
  onRefresh: () => Promise<unknown>;
}>) {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();

  const { removeTeamConfig, removing } = useRemoveDiscordTeamConfig(teamId, {
    onCompleted: () => toast({ title: `#${config.channelName} disconnected` }),
    onError: (error) =>
      toast({
        title: 'Could not disconnect the Discord channel',
        description: error.message,
        variant: 'destructive',
      }),
  });

  const { sendTestMessage, sending } = useSendDiscordTestMessage({
    onCompleted: () =>
      toast({
        title: 'Test message sent',
        description: `Check #${config.channelName} in Discord.`,
      }),
    onError: (error) => {
      toast({
        title: 'Could not send the test message',
        description: error.message,
        variant: 'destructive',
      });
      void onRefresh().catch((refreshError: Error) =>
        toast({
          title: 'Could not refresh the Discord channels',
          description: refreshError.message,
          variant: 'destructive',
        }),
      );
    },
  });

  function handleRemove() {
    confirm({
      message: `Stop posting this team’s updates to #${config.channelName}? Messages already posted stay in the channel.`,
    }).then(() => {
      removeTeamConfig({ variables: { _id: config._id } });
    });
  }

  const removeButton = (
    <Button
      size="sm"
      variant="destructive"
      onClick={handleRemove}
      disabled={removing}
    >
      {removing ? <Spinner size="sm" /> : 'Disconnect'}
    </Button>
  );

  if (!connection) {
    return (
      <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
        <Alert variant="destructive">
          <Alert.Description>
            The Discord server of #{config.channelName} is no longer connected.
            Choose another server and channel, or disconnect it.
          </Alert.Description>
        </Alert>
        <div className="flex flex-wrap justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={onEdit}>
            Change
          </Button>
          {removeButton}
        </div>
      </div>
    );
  }

  const isBroken = connection.health?.status === 'broken';

  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar size="xl">
            <Avatar.Image
              src={connection.guildIconUrl ?? undefined}
              alt={connection.guildName}
            />
            <Avatar.Fallback>
              {connection.guildName[0]?.toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold">#{config.channelName}</p>
            <p className="truncate text-sm text-muted-foreground">
              {connection.guildName}
            </p>
          </div>
        </div>
        <Badge variant={config.isActive ? 'success' : 'secondary'}>
          {config.isActive ? 'Active' : 'Paused'}
        </Badge>
      </div>

      <TeamDiscordEventBadges config={config} />

      <TeamDiscordDeliveryAlert config={config} connection={connection} />

      {config.lastSentAt ? (
        <p className="text-xs text-muted-foreground">
          Last message sent {formatDateTime(config.lastSentAt)}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-2">
        {isBroken ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/operation/settings/discord-integration')}
          >
            Open Discord Integration
          </Button>
        ) : (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => sendTestMessage({ variables: { _id: config._id } })}
            disabled={sending}
          >
            {sending ? <Spinner size="sm" /> : 'Send test message'}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={onEdit}>
          Change
        </Button>
        {removeButton}
      </div>
    </div>
  );
}
