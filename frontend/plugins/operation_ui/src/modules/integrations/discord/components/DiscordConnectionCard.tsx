import { Avatar, Badge, Button, Spinner, useConfirm, useToast } from 'erxes-ui';
import { useDisconnectDiscord } from '../hooks/useDiscordIntegration';
import { DiscordMemberLinking } from './DiscordMemberLinking';
import { DiscordSlashCommands } from './DiscordSlashCommands';
import { IDiscordConnection } from '../types';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export function DiscordConnectionCard({
  connection,
  linkedTeamCount,
  onUpdateToken,
}: {
  connection: IDiscordConnection;
  linkedTeamCount: number;
  onUpdateToken: () => void;
}) {
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const isBroken = connection.health?.status === 'broken';
  const { disconnectDiscord, disconnecting } = useDisconnectDiscord({
    onCompleted: () => toast({ title: 'Discord server disconnected' }),
    onError: (error) =>
      toast({
        title: 'Could not disconnect the Discord server',
        description: error.message,
        variant: 'destructive',
      }),
  });

  function handleDisconnect() {
    confirm({
      message: `Disconnect ${connection.guildName}? erxes forgets the bot token. The bot stays in the server until you remove it in Discord.`,
    }).then(() => {
      disconnectDiscord({ variables: { _id: connection._id } });
    });
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface p-3">
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
            <div className="flex items-center gap-2">
              <span className="truncate font-semibold">
                {connection.guildName}
              </span>
              <Badge variant={isBroken ? 'destructive' : 'success'}>
                {isBroken ? 'Token broken' : 'Active'}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {connection.botUsername} · {linkedTeamCount} team
              {linkedTeamCount === 1 ? '' : 's'} · Connected{' '}
              {formatDate(connection.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="secondary" onClick={onUpdateToken}>
            Update token
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDisconnect}
            disabled={disconnecting || linkedTeamCount > 0}
          >
            {disconnecting ? <Spinner size="sm" /> : 'Disconnect'}
          </Button>
        </div>
      </div>
      {isBroken && connection.health?.lastError ? (
        <p className="text-xs text-destructive">
          {connection.health.lastError}
        </p>
      ) : null}
      {linkedTeamCount > 0 ? (
        <p className="text-xs text-muted-foreground">
          Disconnect its teams in Team settings → Discord before removing the
          server.
        </p>
      ) : null}
      <DiscordMemberLinking connection={connection} />
      <DiscordSlashCommands connection={connection} />
    </div>
  );
}
