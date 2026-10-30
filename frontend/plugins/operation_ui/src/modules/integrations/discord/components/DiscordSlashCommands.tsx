import { Badge, Button, Spinner, useConfirm, useToast } from 'erxes-ui';
import {
  useDisableDiscordCommands,
  useEnableDiscordCommands,
} from '../hooks/useDiscordCommands';
import { IDiscordConnection } from '../types';

const COMMANDS_STATUS = {
  on: { label: 'On', badge: 'success', action: 'Turn off' },
  failed: { label: 'Failed', badge: 'destructive', action: 'Try again' },
  off: { label: 'Off', badge: 'secondary', action: 'Turn on' },
} as const;

const getCommandsStatus = (connection: IDiscordConnection) => {
  if (connection.commandsRegisteredAt) {
    return 'on';
  }

  return connection.commandsError ? 'failed' : 'off';
};

export function DiscordSlashCommands({
  connection,
}: {
  connection: IDiscordConnection;
}) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const status = getCommandsStatus(connection);
  const isOn = status === 'on';

  const { enableCommands, enabling } = useEnableDiscordCommands({
    onCompleted: ({ operationDiscordEnableCommands: result }) => {
      if (result?.commandsRegisteredAt) {
        toast({
          title: 'Slash commands turned on',
          description:
            '/triage new and /tasks now work in linked customer channels.',
        });
        return;
      }

      toast({
        title: 'Could not turn on slash commands',
        description: result?.commandsError ?? undefined,
        variant: 'destructive',
      });
    },
    onError: (error) =>
      toast({
        title: 'Could not turn on slash commands',
        description: error.message,
        variant: 'destructive',
      }),
  });

  const { disableCommands, disabling } = useDisableDiscordCommands({
    onCompleted: () => toast({ title: 'Slash commands turned off' }),
    onError: (error) =>
      toast({
        title: 'Could not turn off slash commands',
        description: error.message,
        variant: 'destructive',
      }),
  });

  function handleTurnOn() {
    enableCommands({ variables: { _id: connection._id } });
  }

  function handleTurnOff() {
    confirm({
      message: `Turn off slash commands? /triage new and /tasks disappear from ${connection.guildName} until they are turned on again.`,
    }).then(() => {
      disableCommands({ variables: { _id: connection._id } });
    });
  }

  const busy = enabling || disabling;

  return (
    <div className="space-y-1 border-t border-border pt-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Slash commands</span>
          <Badge variant={COMMANDS_STATUS[status].badge}>
            {COMMANDS_STATUS[status].label}
          </Badge>
          <span>
            {isOn
              ? '/triage new and /tasks work in linked customer channels.'
              : 'Lets company channels report triages and list tasks.'}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={isOn ? handleTurnOff : handleTurnOn}
          disabled={busy}
        >
          {busy ? <Spinner size="sm" /> : COMMANDS_STATUS[status].action}
        </Button>
      </div>
      {status === 'failed' ? (
        <p className="text-xs text-destructive">{connection.commandsError}</p>
      ) : null}
    </div>
  );
}
