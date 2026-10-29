import { useState } from 'react';
import { IconBrandDiscord } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Spinner,
  useConfirm,
  useToast,
} from 'erxes-ui';
import { DISCORD_EVENT_OPTIONS } from '../constants';
import {
  useDisconnectDiscordTeam,
  useDiscordConfigByTeam,
  useDiscordConnections,
  useSendDiscordTestMessage,
} from '../hooks/useDiscordIntegration';
import { ConnectDiscordDialog } from './ConnectDiscordDialog';
import { TeamDiscordDialog } from './TeamDiscordDialog';
import { TeamDiscordMembers } from './TeamDiscordMembers';

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export function TeamDiscordSettings({ teamId }: { teamId: string }) {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const {
    connections,
    loading: connectionsLoading,
    error: connectionsError,
  } = useDiscordConnections();
  const {
    config,
    loading: configLoading,
    error: configError,
    refetch: refetchConfig,
  } = useDiscordConfigByTeam(teamId);
  const connection = connections.find(
    (item) => item._id === config?.connectionId,
  );

  const { disconnectTeam, disconnecting } = useDisconnectDiscordTeam(teamId, {
    onCompleted: () => toast({ title: 'Discord channel disconnected' }),
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
        description: `Check #${config?.channelName ?? ''} in Discord.`,
      }),
    onError: (error) => {
      toast({
        title: 'Could not send the test message',
        description: error.message,
        variant: 'destructive',
      });
      void refetchConfig().catch((refetchError: Error) =>
        toast({
          title: 'Could not refresh the Discord channel',
          description: refetchError.message,
          variant: 'destructive',
        }),
      );
    },
  });

  function handleConnect() {
    if (connections.length === 0) {
      setConnectDialogOpen(true);
      return;
    }

    setConfigDialogOpen(true);
  }

  function handleDisconnect() {
    confirm({
      message:
        'Stop posting this team’s updates to Discord? Messages already posted stay in the channel.',
    }).then(() => {
      disconnectTeam({ variables: { teamId } });
    });
  }

  if (connectionsLoading || configLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (connectionsError || configError) {
    return (
      <Alert variant="destructive">
        Failed to load the Discord configuration. Please refresh and try again.
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <Card.Header>
          <div className="flex items-center gap-2">
            <IconBrandDiscord className="size-5" />
            <Card.Title>Discord channel</Card.Title>
          </div>
          <Card.Description>
            Post this team’s triage and task updates to one Discord channel.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          {config && connection ? (
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
                    <p className="truncate font-semibold">
                      #{config.channelName}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {connection.guildName}
                    </p>
                  </div>
                </div>
                <Badge variant={config.isActive ? 'success' : 'secondary'}>
                  {config.isActive ? 'Active' : 'Paused'}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {DISCORD_EVENT_OPTIONS.filter((option) =>
                  config.events.includes(option.value),
                ).map((option) => (
                  <Badge key={option.value} variant="secondary">
                    {option.label}
                  </Badge>
                ))}
              </div>

              {connection.health?.status === 'broken' ? (
                <Alert variant="destructive">
                  The bot token for {connection.guildName} stopped working.
                  Update it in Discord Integration settings.
                </Alert>
              ) : config.lastError ? (
                <Alert variant="warning">
                  The last message failed: {config.lastError}
                </Alert>
              ) : null}

              {config.lastSentAt ? (
                <p className="text-xs text-muted-foreground">
                  Last message sent {formatDateTime(config.lastSentAt)}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2">
                {connection.health?.status === 'broken' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      navigate('/operation/settings/discord-integration')
                    }
                  >
                    Open Discord Integration
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => sendTestMessage({ variables: { teamId } })}
                    disabled={sending}
                  >
                    {sending ? <Spinner size="sm" /> : 'Send test message'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setConfigDialogOpen(true)}
                >
                  Change
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? <Spinner size="sm" /> : 'Disconnect'}
                </Button>
              </div>
            </div>
          ) : config ? (
            <div className="space-y-4">
              <Alert variant="destructive">
                This team’s Discord server is no longer connected. Choose
                another server and channel to keep receiving updates.
              </Alert>
              <Button onClick={handleConnect}>Change channel</Button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <IconBrandDiscord className="size-10 text-muted-foreground" />
              <div>
                <p className="font-medium">No Discord channel connected</p>
                <p className="text-sm text-muted-foreground">
                  Choose a channel to post new triages, accepted and declined
                  triages, assignments and completed tasks.
                </p>
              </div>
              <Button onClick={handleConnect}>
                {connections.length > 0
                  ? 'Choose a Discord channel'
                  : 'Connect a Discord server'}
              </Button>
            </div>
          )}
        </Card.Content>
      </Card>

      <TeamDiscordMembers teamId={teamId} />

      <TeamDiscordDialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        teamId={teamId}
        connections={connections}
        currentConfig={config}
      />

      <ConnectDiscordDialog
        open={connectDialogOpen}
        onClose={() => setConnectDialogOpen(false)}
        onConnected={() => setConfigDialogOpen(true)}
      />
    </>
  );
}
