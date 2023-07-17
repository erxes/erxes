import { debugBase } from '@erxes/api-utils/src/debuggers';
import fetch from 'node-fetch';
import { DISCORD_API_URL } from './constants';

export const getEnv = ({
  name,
  defaultValue
}: {
  name: string;
  defaultValue?: string;
}): string => {
  const value = process.env[name];

  if (!value && typeof defaultValue !== 'undefined') {
    return defaultValue;
  }

  if (!value) {
    debugBase(`Missing environment variable configuration for ${name}`);
  }

  return value || '';
};

export const getGuildChannels = async (
  guildId: string,
  authorizationHeader: string
) => {
  const response = await fetch(
    `${DISCORD_API_URL}/guilds/${guildId}/channels`,
    {
      method: 'GET',
      headers: {
        Authorization: authorizationHeader
      }
    }
  );

  const data = await response.json();
  if (response.status == 200) {
    return data;
  }

  if (response.status == 401) {
    throw new Error('Bot is not authorized for this guild');
  }
  throw new Error(data.message);
};
