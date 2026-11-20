import { META_APP_SOURCES } from '@erxes/core-db/integrationEnums';
import { caller, type Db, metaConnections, newId, runAs, withOrg } from '@erxes/core-db';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { memberOf } from '~/http/auth';
import { seal } from '~/lib/secrets';
import { inOrder } from '~/lib/sequence';
import { signJwt, verifyJwt } from '~/lib/signing';
import { recordAudit } from '~/modules/audit/audit.service';
import { appLink } from '~/modules/email/email';
import { appOf, callbackUrl, type MetaApp, type MetaAppSource } from './app.service';
import { subscribeToPage } from './connections.service';
import { graph } from './graph';
import { routeThroughRelay } from './relay';

const STATE_TYP = 'erxes-meta-login+jwt';

const SCOPES = [
  'pages_show_list',
  'pages_messaging',
  'pages_manage_metadata',
  'pages_read_engagement',
  'pages_read_user_content',
  'pages_manage_engagement',
  'pages_manage_posts',
  'business_management',
  'instagram_basic',
  'instagram_manage_messages',
  'instagram_manage_comments',
];

const SETTINGS_PATH = '/settings/integrations/meta';

const State = z.object({ org: z.string(), user: z.string(), app: z.enum(META_APP_SOURCES) });

const Token = z.object({ access_token: z.string() });

const Pages = z.object({
  data: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      access_token: z.string(),
      instagram_business_account: z
        .object({ id: z.string(), username: z.string().optional() })
        .optional(),
    }),
  ),
});

export const loginUrl = async (client: Db, orgId: string) => {
  const app = await appOf(client);

  if (!app)
    throw fail(
      'META_NOT_SET_UP',
      'Set your Meta app in Settings › Integrations › Meta to connect Facebook and Instagram',
    );

  const { userId } = caller('user');
  const url = new URL(config.meta.dialogUrl);

  url.searchParams.set('client_id', app.appId);
  url.searchParams.set('redirect_uri', await callbackUrl(client, app.source));
  url.searchParams.set('scope', SCOPES.join(','));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set(
    'state',
    await signJwt(
      { org: orgId, user: userId, app: app.source },
      { typ: STATE_TYP, expiresInSeconds: 600 },
    ),
  );

  return { url: url.toString() };
};

export const readState = (token: string) =>
  verifyJwt(token, State, { typ: STATE_TYP, maxTokenAge: '10m' }).catch(() => {
    throw fail('INVALID_SIGNATURE', 'The Meta login is not one erxes started, or it expired');
  });

const userTokenOf = async (code: string, app: MetaApp, redirectUri: string) => {
  const short = Token.parse(
    await graph('oauth/access_token', null, {
      query: {
        client_id: app.appId,
        client_secret: app.appSecret,
        redirect_uri: redirectUri,
        code,
      },
    }),
  );

  return Token.parse(
    await graph('oauth/access_token', null, {
      query: {
        grant_type: 'fb_exchange_token',
        client_id: app.appId,
        client_secret: app.appSecret,
        fb_exchange_token: short.access_token,
      },
    }),
  ).access_token;
};

type Page = z.infer<typeof Pages>['data'][number];

const connectionsOf = (pages: Page[], app: MetaAppSource) =>
  pages.flatMap((page) => {
    const linked = page.instagram_business_account;

    const shared = { pageId: page.id, tokenSealed: seal(page.access_token), app };

    return [
      {
        ...shared,
        kind: 'facebook' as const,
        externalId: page.id,
        name: page.name,
        username: null,
      },
      ...(linked
        ? [
            {
              ...shared,
              kind: 'instagram' as const,
              externalId: linked.id,
              name: linked.username ? `@${linked.username}` : page.name,
              username: linked.username ?? null,
            },
          ]
        : []),
    ];
  });

const saveConnections = (
  client: Db,
  connections: ReturnType<typeof connectionsOf>,
  userId: string,
) =>
  inOrder(connections, async (connection) => {
    const fresh = {
      pageId: connection.pageId,
      name: connection.name,
      username: connection.username,
      tokenSealed: connection.tokenSealed,
      app: connection.app,
      status: 'healthy' as const,
      statusReason: null,
      connectedBy: userId,
      connectedAt: sql`now()`,
      checkedAt: sql`now()`,
      updatedAt: sql`now()`,
    };

    await client
      .insert(metaConnections)
      .values({ ...fresh, id: newId(), kind: connection.kind, externalId: connection.externalId })
      .onConflictDoUpdate({
        target: [metaConnections.orgId, metaConnections.kind, metaConnections.externalId],
        set: fresh,
      });
  });

export const connectPages = async (code: string, state: z.infer<typeof State>) => {
  const member = await memberOf(state.org, state.user);

  if (!member) throw fail('UNAUTHORIZED', 'Sign in again to connect pages');

  const { app, redirectUri } = await withOrg(state.org, async (tx) => {
    const found = await appOf(tx);

    return { app: found, redirectUri: found ? await callbackUrl(tx, found.source) : '' };
  });

  if (app?.source !== state.app)
    throw fail('META_NOT_SET_UP', 'The Meta app changed while you logged in: connect again');

  const pages = Pages.parse(
    await graph('me/accounts', await userTokenOf(code, app, redirectUri), {
      query: { fields: 'id,name,access_token,instagram_business_account{id,username}' },
    }),
  ).data;

  const connections = connectionsOf(pages, app.source);

  await Promise.all([
    ...pages.map((page) => subscribeToPage(page.id, page.access_token)),
    ...(app.source === 'install'
      ? connections.map((connection) => routeThroughRelay(connection.kind, connection.externalId))
      : []),
  ]);

  await runAs(member, () =>
    withOrg(state.org, async (tx) => {
      await saveConnections(tx, connections, state.user);
      await recordAudit(tx, {
        action: 'meta.connected',
        targetType: 'meta_connection',
        metadata: {
          pages: connections.map(({ kind, externalId, name }) => ({ kind, externalId, name })),
        },
      });
    }),
  );

  return connections.length;
};

export const settingsLink = (orgId: string, params: Record<string, string>) =>
  withOrg(orgId, (tx) => appLink(tx, `${SETTINGS_PATH}?${new URLSearchParams(params).toString()}`));
