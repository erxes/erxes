import { randomBytes } from 'node:crypto';
import { Request, Response } from 'express';
import { getEnv, getSubdomain, redis } from 'erxes-api-shared/utils';
import {
  TDiscordLinkErrorCode,
  TDiscordLinkResult,
  TDiscordLinkState,
} from '@/discordIntegration/@types/discordUserLink';
import {
  DISCORD_ACCOUNT_PAGE_PATH,
  DISCORD_LINK_ERROR_PARAM,
  DISCORD_LINK_RESULT_PARAM,
  DISCORD_LINK_RESULT_PREFIX,
  DISCORD_LINK_STATE_PREFIX,
  DISCORD_LINK_STATE_TTL_SECONDS,
  DISCORD_MEMBER_LINKING_ON,
  DISCORD_OAUTH_AUTHORIZE_URL,
  DISCORD_OAUTH_CALLBACK_PATH,
} from '@/discordIntegration/constants';
import { generateModels, IModels } from '~/connectionResolvers';
import {
  describeDiscordError,
  exchangeDiscordOAuthCode,
  getDiscordAvatarUrl,
  getDiscordOAuthUser,
  revokeDiscordOAuthToken,
} from '~/utils/discordClient';

const STATE_PATTERN = /^[a-f0-9]{48}$/;

const withoutTrailingSlash = (value: string) => {
  let end = value.length;

  while (end > 0 && value[end - 1] === '/') {
    end -= 1;
  }

  return value.slice(0, end);
};

const getDomain = (subdomain: string) =>
  withoutTrailingSlash(getEnv({ name: 'DOMAIN', subdomain }));

export const getDiscordGatewayUrl = (subdomain: string) => {
  const explicit = getEnv({ name: 'GATEWAY_URL', subdomain, defaultValue: '' });

  if (explicit) {
    return withoutTrailingSlash(explicit);
  }

  if (process.env.NODE_ENV === 'production') {
    return `${getDomain(subdomain)}/gateway`;
  }

  return withoutTrailingSlash(
    getEnv({
      name: 'REACT_APP_API_URL',
      subdomain,
      defaultValue: 'http://localhost:4000',
    }),
  );
};

export const isSaasVersion = () => getEnv({ name: 'VERSION' }) === 'saas';

export const requireDiscordLinkUser = (user?: { _id?: string } | null) => {
  if (!user?._id) {
    throw new Error('Login required');
  }

  return user._id;
};

export const getDiscordOAuthRedirectUri = (subdomain: string) =>
  `${getDiscordGatewayUrl(
    subdomain,
  )}/pl:operation${DISCORD_OAUTH_CALLBACK_PATH}`;

export const getDiscordAccountPageUrl = (subdomain: string) => {
  const domain = getDomain(subdomain);

  return /^https?:\/\//.test(domain)
    ? `${domain}${DISCORD_ACCOUNT_PAGE_PATH}`
    : '';
};

export const findDiscordLinkingConnection = async (
  models: IModels,
  subdomain: string,
) => {
  await models.DiscordConnection.dropUnreadableClientSecrets(subdomain);

  return models.DiscordConnection.findWithClientSecret({
    subdomain,
    ...DISCORD_MEMBER_LINKING_ON,
  });
};

export const startDiscordAccountLink = async ({
  models,
  subdomain,
  userId,
}: {
  models: IModels;
  subdomain: string;
  userId: string;
}) => {
  const connection = await findDiscordLinkingConnection(models, subdomain);

  if (!connection?.clientSecret) {
    throw new Error(
      'Discord account linking is not set up yet. Ask an admin to add the Discord client secret.',
    );
  }

  const state = randomBytes(24).toString('hex');
  const payload: TDiscordLinkState = {
    subdomain,
    userId,
    connectionId: String(connection._id),
  };

  await redis.set(
    `${DISCORD_LINK_STATE_PREFIX}${state}`,
    JSON.stringify(payload),
    'EX',
    DISCORD_LINK_STATE_TTL_SECONDS,
  );

  const params = new URLSearchParams({
    client_id: connection.applicationId,
    response_type: 'code',
    redirect_uri: getDiscordOAuthRedirectUri(subdomain),
    scope: 'identify',
    state,
  });

  return `${DISCORD_OAUTH_AUTHORIZE_URL}?${params.toString()}`;
};

const consumeRedisValue = async (key: string) => {
  const results = await redis.multi().get(key).del(key).exec();
  const value = results?.[0]?.[1];

  return typeof value === 'string' ? value : null;
};

const consumeDiscordLinkState = async (
  state: string,
): Promise<TDiscordLinkState | null> => {
  if (!STATE_PATTERN.test(state)) {
    return null;
  }

  const value = await consumeRedisValue(`${DISCORD_LINK_STATE_PREFIX}${state}`);

  if (!value) {
    return null;
  }

  try {
    const parsed: Partial<TDiscordLinkState> = JSON.parse(value);

    return parsed.subdomain && parsed.userId && parsed.connectionId
      ? {
          subdomain: parsed.subdomain,
          userId: parsed.userId,
          connectionId: parsed.connectionId,
        }
      : null;
  } catch {
    return null;
  }
};

const consumeDiscordLinkResult = async (
  token: string,
): Promise<TDiscordLinkResult | null> => {
  if (!STATE_PATTERN.test(token)) {
    return null;
  }

  const value = await consumeRedisValue(
    `${DISCORD_LINK_RESULT_PREFIX}${token}`,
  );

  if (!value) {
    return null;
  }

  try {
    const parsed: Partial<TDiscordLinkResult> = JSON.parse(value);

    return parsed.subdomain &&
      parsed.userId &&
      parsed.discordUserId &&
      parsed.username
      ? {
          subdomain: parsed.subdomain,
          userId: parsed.userId,
          discordUserId: parsed.discordUserId,
          username: parsed.username,
          globalName: parsed.globalName ?? null,
          avatarUrl: parsed.avatarUrl ?? null,
        }
      : null;
  } catch {
    return null;
  }
};

const redirectToAccountPage = (
  res: Response,
  accountUrl: string,
  params: Record<string, string>,
) => {
  if (!accountUrl) {
    res
      .status(500)
      .send(
        'Discord sign-in cannot return to erxes because DOMAIN is not an http(s) address.',
      );
    return;
  }

  res.redirect(`${accountUrl}?${new URLSearchParams(params).toString()}`);
};

export const handleDiscordOAuthCallback = async (
  req: Request,
  res: Response,
) => {
  const hostSubdomain = getSubdomain(req);
  const { code, state, error } = req.query;

  const linkState =
    typeof state === 'string' ? await consumeDiscordLinkState(state) : null;

  const subdomain =
    linkState && !isSaasVersion() ? linkState.subdomain : hostSubdomain;
  const accountUrl = getDiscordAccountPageUrl(subdomain);

  const fail = (reason: TDiscordLinkErrorCode) =>
    redirectToAccountPage(res, accountUrl, {
      [DISCORD_LINK_ERROR_PARAM]: reason,
    });

  if (linkState?.subdomain !== subdomain) {
    return fail('expired');
  }

  if (typeof error === 'string' || typeof code !== 'string' || !code) {
    return fail('cancelled');
  }

  try {
    const models = await generateModels(subdomain);
    const connection = await models.DiscordConnection.findWithClientSecret({
      _id: linkState.connectionId,
      subdomain,
    });

    if (!connection?.clientSecret || connection.memberLinkingPaused) {
      return fail('not-set-up');
    }

    const client = {
      applicationId: connection.applicationId,
      clientSecret: connection.clientSecret,
    };

    const token = await exchangeDiscordOAuthCode({
      client,
      code,
      redirectUri: getDiscordOAuthRedirectUri(subdomain),
    });

    const discordUser = await getDiscordOAuthUser(token.access_token);

    await revokeDiscordOAuthToken(client, token.access_token).catch(() => null);

    const result: TDiscordLinkResult = {
      subdomain,
      userId: linkState.userId,
      discordUserId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name ?? null,
      avatarUrl: getDiscordAvatarUrl(discordUser),
    };
    const resultToken = randomBytes(24).toString('hex');

    await redis.set(
      `${DISCORD_LINK_RESULT_PREFIX}${resultToken}`,
      JSON.stringify(result),
      'EX',
      DISCORD_LINK_STATE_TTL_SECONDS,
    );

    return redirectToAccountPage(res, accountUrl, {
      [DISCORD_LINK_RESULT_PARAM]: resultToken,
    });
  } catch (linkError) {
    console.error(
      `Discord account link failed: ${describeDiscordError(linkError)}`,
    );

    return fail('failed');
  }
};

export const confirmDiscordAccountLink = async ({
  models,
  subdomain,
  userId,
  token,
}: {
  models: IModels;
  subdomain: string;
  userId: string;
  token: string;
}) => {
  const result = await consumeDiscordLinkResult(token);

  if (result?.subdomain !== subdomain || result.userId !== userId) {
    throw new Error(
      'This Discord sign-in has expired or was started from another erxes account. Start again from your own account.',
    );
  }

  return models.DiscordUserLink.linkAccount({
    userId,
    discordUserId: result.discordUserId,
    username: result.username,
    globalName: result.globalName,
    avatarUrl: result.avatarUrl,
    linkedAt: new Date(),
    subdomain,
  });
};
