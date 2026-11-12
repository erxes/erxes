import { IDiscordConnection } from '../types';

type TDiscordCommandsStatus = 'on' | 'failed' | 'off';

export const getCommandsStatus = (
  connection: Pick<
    IDiscordConnection,
    'commandsRegisteredAt' | 'commandsError'
  >,
): TDiscordCommandsStatus => {
  if (connection.commandsRegisteredAt) {
    return 'on';
  }

  return connection.commandsError ? 'failed' : 'off';
};

export const formatDiscordDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
