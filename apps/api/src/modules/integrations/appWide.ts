import { type Db, integrationSubscriptions, withOrg, withSystem } from '@erxes/core-db';
import { and, eq, inArray, isNotNull } from 'drizzle-orm';
import { coreKey } from '~/lib/coreKey';
import { hmacSha256 } from '~/lib/crypto';
import { type App, HOOK_CHANNEL, hookEvents } from './apps';
import { providerLink, SERVER_CLIENT } from './oauth';

const signed = (purpose: string, app: string, client: string) =>
  hmacSha256(coreKey(`erxes-integration-app-${purpose}-v1`), `${app}:${client}`, 'base64url');

export const appHookSignature = (app: string, client: string) => signed('hook', app, client);

export const appVerifyToken = (app: string, client: string) => signed('verify', app, client);

export const appHookUrl = (tx: Db, app: string, client: string) =>
  providerLink(
    tx,
    `/core/v1/integrations/apps/${app}/hook/${client}/${appHookSignature(app, client)}`,
  );

const inScope = <T>(orgId: string | null, fn: (tx: Db) => Promise<T>) =>
  orgId ? withOrg(orgId, fn) : withSystem('app-wide hook subscriptions', fn);

const ofApp = (app: App) =>
  and(
    eq(integrationSubscriptions.app, app.key),
    eq(integrationSubscriptions.channel, HOOK_CHANNEL),
  );

export const eventsInUse = (
  app: App,
  where: { client: string; orgId: string; routeKey?: string },
) =>
  inScope(where.client === SERVER_CLIENT ? null : where.orgId, async (tx) => {
    const rows = await tx
      .select({ triggers: integrationSubscriptions.triggers })
      .from(integrationSubscriptions)
      .where(
        and(
          ofApp(app),
          where.routeKey === undefined
            ? isNotNull(integrationSubscriptions.routeKey)
            : eq(integrationSubscriptions.routeKey, where.routeKey),
        ),
      );

    return hookEvents(
      app,
      rows.flatMap((row) => row.triggers),
    ).toSorted();
  });

export const routedSubscriptions = (app: App, client: { orgId: string | null }, routes: string[]) =>
  inScope(client.orgId, async (tx) =>
    routes.length
      ? tx
          .select({
            id: integrationSubscriptions.id,
            orgId: integrationSubscriptions.orgId,
            routeKey: integrationSubscriptions.routeKey,
          })
          .from(integrationSubscriptions)
          .where(and(ofApp(app), inArray(integrationSubscriptions.routeKey, routes)))
      : [],
  );
