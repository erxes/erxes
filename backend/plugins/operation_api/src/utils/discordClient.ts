import {
  TDiscordApplication,
  TDiscordApplicationUpdate,
  TDiscordChannel,
  TDiscordErrorBody,
  TDiscordGuild,
  TDiscordGuildMember,
  TDiscordMessage,
  TDiscordMessagePayload,
  TDiscordOAuthClient,
  TDiscordOAuthToken,
  TDiscordRequestArgs,
  TDiscordSlashCommand,
  TDiscordUser,
} from '@/discordIntegration/@types/discordApi';
import {
  DISCORD_API_URL,
  DISCORD_BOT_PERMISSIONS,
  DISCORD_BOT_SCOPES,
  DISCORD_ERROR_CODES,
  DISCORD_MAX_RATE_LIMIT_RETRIES,
  DISCORD_MESSAGE_CHANNEL_TYPES,
} from '@/discordIntegration/constants';

export class DiscordApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: number,
  ) {
    super(message);
    this.name = 'DiscordApiError';
  }
}

export const sanitizeDiscordToken = (token?: string | null): string =>
  (token || '').replace(/\s/g, '');

const parseBody = (text: string): unknown => {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { message: text };
  }
};

const getRetryAfterMs = (response: Response, body: TDiscordErrorBody) => {
  const headerValue = response.headers.get('retry-after');
  const header = headerValue === null ? NaN : Number(headerValue);
  const seconds = Number.isFinite(header) ? header : Number(body.retry_after);

  return Math.min(
    Math.max((Number.isFinite(seconds) ? seconds : 1) * 1000, 0),
    10_000,
  );
};

const discordRequest = async <T>(
  { token, method = 'GET', path, body }: TDiscordRequestArgs,
  attempt = 0,
): Promise<T> => {
  const response = await fetch(`${DISCORD_API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = parseBody(await response.text());
  const errorBody = data as TDiscordErrorBody;

  if (response.status === 429 && attempt < DISCORD_MAX_RATE_LIMIT_RETRIES) {
    await new Promise((resolve) =>
      setTimeout(resolve, getRetryAfterMs(response, errorBody)),
    );

    return discordRequest<T>({ token, method, path, body }, attempt + 1);
  }

  if (!response.ok) {
    throw new DiscordApiError(
      response.status,
      `Discord API error ${response.status}: ${
        errorBody.message || response.statusText
      }`,
      errorBody.code,
    );
  }

  return data as T;
};

const readDiscordResponse = async <T>(response: Response): Promise<T> => {
  const data = parseBody(await response.text());

  if (!response.ok) {
    const errorBody = data as TDiscordErrorBody;

    throw new DiscordApiError(
      response.status,
      `Discord API error ${response.status}: ${
        errorBody.error_description ||
        errorBody.message ||
        errorBody.error ||
        response.statusText
      }`,
      errorBody.code,
    );
  }

  return data as T;
};

const discordOAuthRequest = async <T>(
  client: TDiscordOAuthClient,
  path: string,
  params: Record<string, string>,
) => {
  const credentials = Buffer.from(
    `${client.applicationId}:${client.clientSecret}`,
  ).toString('base64');

  const response = await fetch(`${DISCORD_API_URL}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  });

  return readDiscordResponse<T>(response);
};

export const exchangeDiscordOAuthCode = ({
  client,
  code,
  redirectUri,
}: {
  client: TDiscordOAuthClient;
  code: string;
  redirectUri: string;
}) =>
  discordOAuthRequest<TDiscordOAuthToken>(client, '/oauth2/token', {
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });

export const revokeDiscordOAuthToken = (
  client: TDiscordOAuthClient,
  token: string,
) =>
  discordOAuthRequest<Record<string, never>>(client, '/oauth2/token/revoke', {
    token,
    token_type_hint: 'access_token',
  });

export const verifyDiscordClientSecret = async (
  client: TDiscordOAuthClient,
) => {
  const token = await discordOAuthRequest<TDiscordOAuthToken>(
    client,
    '/oauth2/token',
    { grant_type: 'client_credentials', scope: 'identify' },
  );

  await revokeDiscordOAuthToken(client, token.access_token);
};

export const getDiscordOAuthUser = async (accessToken: string) => {
  const response = await fetch(`${DISCORD_API_URL}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return readDiscordResponse<TDiscordUser>(response);
};

export const getDiscordGuildMember = async (
  token: string,
  guildId: string,
  userId: string,
) => {
  try {
    return await discordRequest<TDiscordGuildMember>({
      token,
      path: `/guilds/${encodeURIComponent(
        guildId,
      )}/members/${encodeURIComponent(userId)}`,
    });
  } catch (error) {
    if (
      error instanceof DiscordApiError &&
      error.code === DISCORD_ERROR_CODES.UNKNOWN_MEMBER
    ) {
      return null;
    }
    throw error;
  }
};

export const registerDiscordGuildCommands = ({
  token,
  applicationId,
  guildId,
  commands,
}: {
  token: string;
  applicationId: string;
  guildId: string;
  commands: TDiscordSlashCommand[];
}) =>
  discordRequest<TDiscordSlashCommand[]>({
    token,
    method: 'PUT',
    path: `/applications/${encodeURIComponent(
      applicationId,
    )}/guilds/${encodeURIComponent(guildId)}/commands`,
    body: commands,
  });

export const editDiscordInteractionResponse = async ({
  applicationId,
  interactionToken,
  payload,
}: {
  applicationId: string;
  interactionToken: string;
  payload: TDiscordMessagePayload;
}) => {
  const response = await fetch(
    `${DISCORD_API_URL}/webhooks/${encodeURIComponent(
      applicationId,
    )}/${encodeURIComponent(interactionToken)}/messages/@original`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ allowed_mentions: { parse: [] }, ...payload }),
    },
  );

  return readDiscordResponse<TDiscordMessage>(response);
};

export const getDiscordAvatarUrl = (user: TDiscordUser) =>
  user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : null;

export const getDiscordBotUser = (token: string) =>
  discordRequest<TDiscordUser>({ token, path: '/users/@me' });

export const getDiscordApplication = (token: string) =>
  discordRequest<TDiscordApplication>({ token, path: '/applications/@me' });

export const updateDiscordApplication = (
  token: string,
  body: TDiscordApplicationUpdate,
) =>
  discordRequest<TDiscordApplication>({
    token,
    method: 'PATCH',
    path: '/applications/@me',
    body,
  });

export const listDiscordBotGuilds = (token: string) =>
  discordRequest<TDiscordGuild[]>({ token, path: '/users/@me/guilds' });

export const listDiscordGuildChannels = async (
  token: string,
  guildId: string,
) => {
  const channels = await discordRequest<TDiscordChannel[]>({
    token,
    path: `/guilds/${encodeURIComponent(guildId)}/channels`,
  });

  return channels
    .filter((channel) => DISCORD_MESSAGE_CHANNEL_TYPES.includes(channel.type))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
};

export const createDiscordMessage = (
  token: string,
  channelId: string,
  payload: TDiscordMessagePayload,
) =>
  discordRequest<TDiscordMessage>({
    token,
    method: 'POST',
    path: `/channels/${encodeURIComponent(channelId)}/messages`,
    body: { allowed_mentions: { parse: [] }, ...payload },
  });

export const editDiscordMessage = (
  token: string,
  channelId: string,
  messageId: string,
  payload: TDiscordMessagePayload,
) =>
  discordRequest<TDiscordMessage>({
    token,
    method: 'PATCH',
    path: `/channels/${encodeURIComponent(
      channelId,
    )}/messages/${encodeURIComponent(messageId)}`,
    body: { allowed_mentions: { parse: [] }, ...payload },
  });

export const deleteDiscordMessage = async (
  token: string,
  channelId: string,
  messageId: string,
) => {
  try {
    await discordRequest<Record<string, never>>({
      token,
      method: 'DELETE',
      path: `/channels/${encodeURIComponent(
        channelId,
      )}/messages/${encodeURIComponent(messageId)}`,
    });
  } catch (error) {
    if (
      error instanceof DiscordApiError &&
      (error.code === DISCORD_ERROR_CODES.UNKNOWN_MESSAGE ||
        error.code === DISCORD_ERROR_CODES.UNKNOWN_CHANNEL)
    ) {
      return;
    }
    throw error;
  }
};

export const getDiscordGuildIconUrl = (guild: TDiscordGuild) =>
  guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
    : null;

export const buildDiscordInviteUrl = (applicationId: string) =>
  `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(
    applicationId,
  )}&scope=${encodeURIComponent(
    DISCORD_BOT_SCOPES,
  )}&permissions=${DISCORD_BOT_PERMISSIONS}`;

export const isDiscordAuthError = (error: unknown) =>
  error instanceof DiscordApiError && error.status === 401;

export const isRetryableDiscordError = (error: unknown) =>
  !(error instanceof DiscordApiError) ||
  error.status === 429 ||
  error.status >= 500;

export const describeDiscordError = (error: unknown): string => {
  if (error instanceof DiscordApiError) {
    if (error.status === 401) {
      return 'Discord rejected the bot token';
    }

    if (
      error.code === DISCORD_ERROR_CODES.MISSING_ACCESS ||
      error.code === DISCORD_ERROR_CODES.MISSING_PERMISSIONS
    ) {
      return 'The bot cannot post in this channel. Check its channel permissions';
    }

    if (error.code === DISCORD_ERROR_CODES.UNKNOWN_CHANNEL) {
      return 'The Discord channel no longer exists';
    }
  }

  return error instanceof Error ? error.message : String(error);
};
