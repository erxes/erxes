import { randomBytes } from 'crypto';
import { Request, Response } from 'express';
import { getEnv, getSubdomain, redis } from 'erxes-api-shared/utils';
import { TDiscordLinkState } from '@/discordIntegration/@types/discordUserLink';
import {
  DISCORD_ACCOUNT_PAGE_PATH,
  DISCORD_LINK_MESSAGE_TYPE,
  DISCORD_LINK_STATE_PREFIX,
  DISCORD_LINK_STATE_TTL_SECONDS,
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

const withoutTrailingSlash = (value: string) => value.replace(/\/+$/, '');

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

const getUiOrigin = (subdomain: string) => {
  try {
    return new URL(getDomain(subdomain)).origin;
  } catch {
    return '';
  }
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

export const findDiscordLinkingConnection = (
  models: IModels,
  subdomain: string,
) =>
  models.DiscordConnection.findWithSecrets({
    subdomain,
    hasClientSecret: true,
  });

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

const consumeDiscordLinkState = async (
  state: string,
): Promise<TDiscordLinkState | null> => {
  if (!STATE_PATTERN.test(state)) {
    return null;
  }

  const key = `${DISCORD_LINK_STATE_PREFIX}${state}`;
  const results = await redis.multi().get(key).del(key).exec();
  const value = results?.[0]?.[1];

  if (typeof value !== 'string') {
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

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const sendLinkResult = (
  res: Response,
  {
    ok,
    message,
    accountUrl,
    uiOrigin,
  }: { ok: boolean; message: string; accountUrl: string; uiOrigin: string },
) => {
  const payload = JSON.stringify({
    type: DISCORD_LINK_MESSAGE_TYPE,
    ok,
    message,
  }).replace(/</g, '\\u003c');
  const targetOrigin = JSON.stringify(uiOrigin).replace(/</g, '\\u003c');

  const backLink = accountUrl
    ? `<p><a href="${escapeHtml(accountUrl)}">Back to erxes</a></p>`
    : '';

  res.send(`<!DOCTYPE html>
<html><body><script>
  if (window.opener) {
    window.opener.postMessage(${payload}, ${targetOrigin} || window.location.origin);
    window.close();
  }
</script><p>${escapeHtml(message)}</p>${backLink}</body></html>`);
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
  const uiOrigin = getUiOrigin(subdomain);

  const fail = (message: string) =>
    sendLinkResult(res, { ok: false, message, accountUrl, uiOrigin });

  if (!linkState || linkState.subdomain !== subdomain) {
    return fail(
      'This Discord sign-in link is invalid or has expired. Start again from erxes.',
    );
  }

  if (typeof error === 'string' || typeof code !== 'string' || !code) {
    return fail('Discord sign-in was cancelled.');
  }

  try {
    const models = await generateModels(subdomain);
    const connection = await models.DiscordConnection.findWithSecrets({
      _id: linkState.connectionId,
      subdomain,
    });

    if (!connection?.clientSecret) {
      return fail('Discord account linking is no longer set up.');
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

    await models.DiscordUserLink.linkAccount({
      userId: linkState.userId,
      discordUserId: discordUser.id,
      username: discordUser.username,
      globalName: discordUser.global_name ?? null,
      avatarUrl: getDiscordAvatarUrl(discordUser),
      linkedAt: new Date(),
      subdomain,
    });

    return sendLinkResult(res, {
      ok: true,
      message: `Linked the Discord account ${
        discordUser.global_name || discordUser.username
      }.`,
      accountUrl,
      uiOrigin,
    });
  } catch (linkError) {
    return fail(describeDiscordError(linkError));
  }
};
