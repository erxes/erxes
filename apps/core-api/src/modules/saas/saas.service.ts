import type { PluginPlan, SubscriptionInfo } from '@erxes/core-contract';
import { type Db, organizations, pluginInstallations, plugins, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { config } from '~/config';
import type { Actor, PluginCaller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import {
  accessOf,
  type EntitlementRow,
  organizationDisabled,
  readOnlyUntil,
  tierOf,
} from './access';
import { entitlementsOf, manageUrl, rememberSubdomain } from './entitlements';

/** What members can still reach in a disabled organisation: their subscription and signing out. */
const DISABLED_ALLOWED = [/^\/plan$/, /^\/auth\/me$/, /^\/auth\/sign-out$/];

interface GuardedRequest {
  method: string;
  path: string;
  actor?: Actor;
  plugin?: PluginCaller;
}

/** Why the organisation's standing refuses this request, or null. */
const refusalOf = (req: GuardedRequest, orgId: string, row: EntitlementRow | null) => {
  if (
    organizationDisabled(row) &&
    !(req.actor && DISABLED_ALLOWED.some((pattern) => pattern.test(req.path)))
  ) {
    return new HttpError(
      403,
      'ORGANIZATION_DISABLED',
      'This organisation is disabled on erxes.io',
      {
        manageUrl: manageUrl(orgId),
      },
    );
  }

  if (!req.plugin) return null;

  const access = accessOf(row, req.plugin.plugin);

  if (access === 'off')
    return new HttpError(
      403,
      'NOT_IN_PLAN',
      `${req.plugin.plugin} is not in this organisation's plan`,
    );

  if (access === 'read_only' && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return new HttpError(
      402,
      'READ_ONLY',
      `${req.plugin.plugin} left the plan: read-only until it is bought again`,
    );
  }

  return null;
};

/**
 * After authentication: a disabled organisation (erxes.io `inactive` or
 * `suspended`) lets nobody in; a plugin that is `off` is refused, and a
 * `read_only` one can read but not change anything in core (402).
 */
export const standingGuard = async (
  req: GuardedRequest,
  _res: unknown,
  next: (error?: unknown) => void,
) => {
  const orgId = config.saas.enabled ? (req.actor?.orgId ?? req.plugin?.orgId) : undefined;

  if (!orgId) return next();

  const refusal = refusalOf(req, orgId, await entitlementsOf(orgId));

  return refusal ? next(refusal) : next();
};

const pluginRows = async (client: Db, orgId: string) => {
  const registered = await client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins);

  const active = await client
    .select({ plugin: pluginInstallations.plugin })
    .from(pluginInstallations)
    .where(and(eq(pluginInstallations.orgId, orgId), eq(pluginInstallations.status, 'active')));

  return {
    titles: new Map(registered.map((item) => [item.name, item.manifest?.title ?? item.name])),
    active: new Set(active.map((item) => item.plugin)),
  };
};

/** The member's plan: asks erxes.io first if needed, then reads in a short scope. */
export const subscriptionInfo = async (actor: Actor): Promise<SubscriptionInfo> => {
  const row = await entitlementsOf(actor.orgId);

  return withOrg(actor.orgId, (tx) => planOf(tx, actor, row));
};

const planOf = async (
  client: Db,
  actor: Actor,
  row: EntitlementRow | null,
): Promise<SubscriptionInfo> => {
  if (!config.saas.enabled) {
    return {
      saas: false,
      organizationStatus: 'active',
      plugins: [],
      manageUrl: null,
      checkedAt: null,
    };
  }

  const [org] = await client
    .select({ subdomain: organizations.subdomain })
    .from(organizations)
    .where(eq(organizations.id, actor.orgId))
    .limit(1);

  if (org) rememberSubdomain(actor.orgId, org.subdomain);

  const { titles, active } = await pluginRows(client, actor.orgId);

  const codes = [
    ...new Set([
      ...(row?.plugins ?? []).map((plugin) => plugin.code),
      ...Object.keys(row?.lapsed ?? {}),
    ]),
  ];

  return {
    saas: true,
    organizationStatus: row?.orgStatus ?? 'active',
    plugins: codes.map((code) => {
      const entry = row?.plugins.find((plugin) => plugin.code === code);
      const access = accessOf(row, code);

      return {
        code,
        title: titles.get(code) ?? code,
        tier: entry?.tier ?? null,
        status: entry?.status ?? null,
        access,
        readOnlyUntil:
          access === 'read_only' ? (readOnlyUntil(row, code)?.toISOString() ?? null) : null,
        installed: active.has(code),
      };
    }),
    manageUrl: manageUrl(actor.orgId),
    checkedAt: row && row.fetchedAt.getTime() > 0 ? row.fetchedAt.toISOString() : null,
  };
};

export const pluginPlan = async (caller: PluginCaller): Promise<PluginPlan> => {
  const row = await entitlementsOf(caller.orgId);
  const entry = row?.plugins.find((plugin) => plugin.code === caller.plugin);
  const access = accessOf(row, caller.plugin);

  return {
    saas: config.saas.enabled,
    tier: tierOf(row, caller.plugin),
    status: entry?.status ?? null,
    access,
    readOnlyUntil:
      access === 'read_only' ? (readOnlyUntil(row, caller.plugin)?.toISOString() ?? null) : null,
  };
};
