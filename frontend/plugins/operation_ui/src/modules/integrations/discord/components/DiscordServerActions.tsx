import { useState } from 'react';
import { IconKey, IconSlash, IconTrash } from '@tabler/icons-react';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useToast,
} from 'erxes-ui';
import {
  useDisableDiscordCommands,
  useEnableDiscordCommands,
} from '../hooks/useDiscordCommands';
import { useDisconnectDiscord } from '../hooks/useDiscordIntegration';
import { getCommandsStatus } from '../utils/discordStatus';
import { TDiscordServerRow } from '../types';
import { ConnectDiscordSheet } from './ConnectDiscordSheet';

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

const describeDisconnectBlockers = (server: TDiscordServerRow) =>
  [
    server.customerChannelCount > 0
      ? `unlink its ${pluralize(
          server.customerChannelCount,
          'customer channel',
        )} in Customer channels`
      : '',
    server.teamCount > 0
      ? `disconnect its ${pluralize(
          server.teamCount,
          'team',
        )} in Team settings → Discord`
      : '',
  ]
    .filter(Boolean)
    .join(' and ');

const COMMANDS_ACTION_LABEL = {
  on: 'Turn off slash commands',
  failed: 'Retry slash commands',
  off: 'Turn on slash commands',
} as const;

export function DiscordServerActions({
  server,
}: Readonly<{ server: TDiscordServerRow }>) {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tokenSheetOpen, setTokenSheetOpen] = useState(false);
  const commandsStatus = getCommandsStatus(server);

  const showError = (title: string) => (error: Error) =>
    toast({ title, description: error.message, variant: 'destructive' });

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
    onError: showError('Could not turn on slash commands'),
  });

  const { disableCommands, disabling } = useDisableDiscordCommands({
    onCompleted: () => toast({ title: 'Slash commands turned off' }),
    onError: showError('Could not turn off slash commands'),
  });

  const { disconnectDiscord, disconnecting } = useDisconnectDiscord({
    onCompleted: () => toast({ title: 'Discord server disconnected' }),
    onError: showError('Could not disconnect the Discord server'),
  });

  const busy = enabling || disabling || disconnecting;

  function run(action: () => void) {
    setMenuOpen(false);
    action();
  }

  function handleCommands() {
    if (commandsStatus === 'on') {
      confirm({
        message: `Turn off slash commands? /triage new and /tasks disappear from ${server.guildName} until they are turned on again.`,
      }).then(() => disableCommands({ variables: { _id: server._id } }));
      return;
    }

    confirm({
      message: `Turn on slash commands for ${server.guildName}? erxes becomes this bot's interactions endpoint, so slash commands and buttons the bot handles anywhere else stop working. Use a bot made only for erxes.`,
    }).then(() => enableCommands({ variables: { _id: server._id } }));
  }

  function handleDisconnect() {
    const blockers = describeDisconnectBlockers(server);

    if (blockers) {
      toast({
        title: `${server.guildName} is still in use`,
        description: `Before removing the server, ${blockers}.`,
        variant: 'warning',
      });
      return;
    }

    confirm({
      message: `Disconnect ${server.guildName}? erxes removes /triage and /tasks from the server, stops receiving this bot's interactions and forgets the bot token. The bot stays in the server until you remove it in Discord.`,
    }).then(() => disconnectDiscord({ variables: { _id: server._id } }));
  }

  return (
    <>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <Popover.Trigger asChild>
          <RecordTable.MoreButton
            className="h-full w-full"
            disabled={busy}
            aria-label={`Actions for ${server.guildName}`}
          />
        </Popover.Trigger>
        <Combobox.Content className="w-60">
          <Command shouldFilter={false}>
            <Command.List>
              <Command.Item
                value="token"
                onSelect={() => run(() => setTokenSheetOpen(true))}
              >
                <IconKey />
                Update bot token
              </Command.Item>
              <Command.Item
                value="commands"
                onSelect={() => run(handleCommands)}
              >
                <IconSlash />
                {COMMANDS_ACTION_LABEL[commandsStatus]}
              </Command.Item>
              <Command.Item
                value="disconnect"
                className="text-destructive"
                onSelect={() => run(handleDisconnect)}
              >
                <IconTrash />
                Disconnect
              </Command.Item>
            </Command.List>
          </Command>
        </Combobox.Content>
      </Popover>

      <ConnectDiscordSheet
        open={tokenSheetOpen}
        onOpenChange={setTokenSheetOpen}
        connection={server}
      />
    </>
  );
}
