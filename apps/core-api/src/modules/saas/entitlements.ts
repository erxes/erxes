import {
  type Db,
  entitlements,
  type EntitledPlugin,
  organizations,
  pluginInstallations,
  plugins,
  usedTokens,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, lt, sql } from 'drizzle-orm';
import { config } from '~/config';
import { systemCaller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { oneRow } from '~/lib/rows';
import { logger } from '~/logger';
import { recordAudit } from '~/modules/audit/audit.service';
import { accessOf, type EntitlementRow, NOT_IN_PLAN } from './access';
import { askPlatform, type PlatformEntitlements } from './platform';

const log = logger.child({ component: 'saas' });

/** erxes.io answers with `Cache-Control: max-age=30`: older than this, ask again (in the background). */
const FRESH_MS = 30_000;

/**
 * Plugins follow their access: in the plan and not installed → installed
 * (with the scopes they ask for); `off` → turned off with `NOT_IN_PLAN`
 * (data kept, tokens refused); bought again → on again. Read-only plugins
 * stay installed (their tokens can still read). Ones the owner uninstalled
 * stay uninstalled.
 */
const reconcilePlugins = async (tx: Db, orgId: string, row: EntitlementRow, now = new Date()) => {
  const registered = await tx
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .where(eq(plugins.status, 'active'));

  const installed = new Map(
    (await tx.select().from(pluginInstallations).where(eq(pluginInstallations.orgId, orgId))).map(
      (item) => [item.plugin, item],
    ),
  );

  const changes: { plugin: string; change: 'installed' | 'resumed' | 'removed' }[] = [];

  for (const plugin of registered) {
    const access = accessOf(row, plugin.name, now);
    const installation = installed.get(plugin.name);
    const inPlan = access === 'full' || access === 'warning';

    const where = and(
      eq(pluginInstallations.orgId, orgId),
      eq(pluginInstallations.plugin, plugin.name),
    );

    if (inPlan && !installation) {
      await tx
        .insert(pluginInstallations)
        .values({ orgId, plugin: plugin.name, grantedScopes: plugin.manifest?.scopes ?? [] })
        .onConflictDoNothing();
      changes.push({ plugin: plugin.name, change: 'installed' });
    } else if (
      inPlan &&
      installation?.status === 'disabled' &&
      installation.statusReason === NOT_IN_PLAN
    ) {
      await tx
        .update(pluginInstallations)
        .set({ status: 'active', statusReason: null, updatedAt: sql`now()` })
        .where(where);
      changes.push({ plugin: plugin.name, change: 'resumed' });
    } else if (access === 'off' && installation?.status === 'active') {
      await tx
        .update(pluginInstallations)
        .set({ status: 'disabled', statusReason: NOT_IN_PLAN, updatedAt: sql`now()` })
        .where(where);
      changes.push({ plugin: plugin.name, change: 'removed' });
    }
  }

  return changes;
};

/** Rows read on every request: kept 30 s per process, replaced at once when this process refreshes. */
const cache = new Map<string, { row: EntitlementRow | null; at: number }>();
const inFlight = new Map<string, Promise<EntitlementRow | null>>();

/** Subdomains seen while refreshing, for the billing link (`SAAS_BILLING_URL` with `{subdomain}`). */
const subdomains = new Map<string, string>();

export const rememberSubdomain = (orgId: string, subdomain: string) =>
  subdomains.set(orgId, subdomain);

export const manageUrl = (orgId: string) => {
  if (!config.saas.billingUrl.includes('{subdomain}')) return config.saas.billingUrl;

  const subdomain = subdomains.get(orgId);

  return subdomain ? config.saas.billingUrl.replace('{subdomain}', subdomain) : null;
};

/** Drops this process's cached answer (the next request reads the database). */
export const forgetEntitlements = (orgId: string) => cache.delete(orgId);

const describe = (list: EntitledPlugin[] = []) =>
  list
    .map((plugin) => `${plugin.code}:${plugin.tier}:${plugin.status}`)
    .toSorted()
    .join(',');

/** Plugins that disappeared are marked lapsed (kept while still gone); ones that came back are cleared. */
const lapsedAfter = (
  before: EntitlementRow | undefined,
  answer: PlatformEntitlements,
  now: Date,
) => {
  const codes = new Set(answer.plugins.map((plugin) => plugin.code));
  const lapsed: Record<string, string> = {};

  for (const [code, since] of Object.entries(before?.lapsed ?? {}))
    if (!codes.has(code)) lapsed[code] = since;

  for (const plugin of before?.plugins ?? [])
    if (!codes.has(plugin.code) && !lapsed[plugin.code]) lapsed[plugin.code] = now.toISOString();

  return lapsed;
};

/** Stores erxes.io's answer, makes installations follow, and audits what changed as the system. */
const storeAnswer = (orgId: string, name: string, answer: PlatformEntitlements) =>
  withOrg(orgId, async (tx) => {
    const [before] = await tx
      .select()
      .from(entitlements)
      .where(eq(entitlements.orgId, orgId))
      .for('update')
      .limit(1);

    const now = new Date();

    const values = {
      orgStatus: answer.orgStatus,
      plugins: answer.plugins,
      lapsed: lapsedAfter(before, answer, now),
      fetchedAt: now,
      lastError: null,
    };

    const row = oneRow(
      await tx
        .insert(entitlements)
        .values({ orgId, ...values })
        .onConflictDoUpdate({ target: entitlements.orgId, set: values })
        .returning(),
    );

    const changes = await reconcilePlugins(tx, orgId, row, now);

    if (
      !before ||
      describe(before.plugins) !== describe(row.plugins) ||
      before.orgStatus !== row.orgStatus ||
      changes.length
    ) {
      await recordAudit(tx, systemCaller(orgId), {
        action: 'saas.entitlements_changed',
        targetType: 'organization',
        targetId: orgId,
        targetLabel: name,
        metadata: {
          status: { before: before?.orgStatus ?? null, after: row.orgStatus },
          plugins: { before: before?.plugins ?? null, after: row.plugins },
          lapsed: row.lapsed,
          installations: changes,
        },
      });
    }

    return row;
  });

/** erxes.io can't be reached: the stored answer stays in force, with the error noted. */
const keepWithError = (orgId: string, error: unknown) => {
  log.warn(
    { org: orgId, err: error },
    'could not read entitlements from erxes.io; keeping the last answer',
  );

  const message = error instanceof Error ? error.message : String(error);

  return withOrg(orgId, async (tx) => {
    const [row] = await tx
      .update(entitlements)
      .set({ lastError: message.slice(0, 300) })
      .where(eq(entitlements.orgId, orgId))
      .returning();

    return row ?? null;
  });
};

const storedEntitlements = (orgId: string) =>
  withOrg(
    orgId,
    async (tx) =>
      (await tx.select().from(entitlements).where(eq(entitlements.orgId, orgId)).limit(1))[0] ??
      null,
  );

const fetchEntitlements = async (orgId: string) => {
  const [org] = await withSystem('saas: organisation', (tx) =>
    tx
      .select({ subdomain: organizations.subdomain, name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1),
  );

  if (!org) return null;

  rememberSubdomain(orgId, org.subdomain);

  const answer = await askPlatform(org.subdomain).then(
    (value) => ({ value }),
    (error: unknown) => ({ error }),
  );

  if ('error' in answer) return keepWithError(orgId, answer.error);

  if (!answer.value) {
    log.warn(
      { org: orgId, subdomain: org.subdomain },
      'erxes.io does not know this organisation; keeping the last answer',
    );

    return storedEntitlements(orgId);
  }

  return storeAnswer(orgId, org.name, answer.value);
};

/**
 * Asks erxes.io what the organisation has and stores it: plugins that
 * disappeared are marked lapsed (read-only, then off), ones that came back
 * are cleared, installations follow. If erxes.io can't be reached the
 * stored answer stays in force. Changes are audited as the system.
 */
export const refreshEntitlements = (orgId: string): Promise<EntitlementRow | null> => {
  const running = inFlight.get(orgId);

  if (running) return running;

  const run = fetchEntitlements(orgId)
    .then((row) => {
      cache.set(orgId, { row, at: Date.now() });

      return row;
    })
    .finally(() => inFlight.delete(orgId));

  inFlight.set(orgId, run);

  return run;
};

/**
 * The organisation's entitlements for a request: from this process's cache,
 * else the database; a stale answer is used while a fresh one is fetched in
 * the background; the very first time, erxes.io is asked (3 s at most, then
 * the organisation is let in and asked again later).
 */
export const entitlementsOf = async (orgId: string): Promise<EntitlementRow | null> => {
  if (!config.saas.enabled) return null;

  const hit = cache.get(orgId);

  if (hit && Date.now() - hit.at < FRESH_MS) return hit.row;

  const row = await storedEntitlements(orgId);

  const failed = (error: unknown) => {
    log.warn({ org: orgId, err: error }, 'entitlement refresh failed');

    return null;
  };

  if (row) {
    cache.set(orgId, { row, at: Date.now() });

    if (Date.now() - row.fetchedAt.getTime() > FRESH_MS) refreshEntitlements(orgId).catch(failed);

    return row;
  }

  return Promise.race([
    refreshEntitlements(orgId).catch(failed),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 3_000)),
  ]);
};

/** Hourly: every organisation asked again, and read-only plugins past their grace turned off. */
export const refreshAllEntitlements = async () => {
  if (!config.saas.enabled) return 0;

  const orgs = await withSystem('saas: organisations', (tx) =>
    tx.select({ id: organizations.id }).from(organizations),
  );

  let refreshed = 0;

  for (const org of orgs) {
    await refreshEntitlements(org.id)
      .then(() => (refreshed += 1))
      .catch((error: unknown) =>
        log.warn({ org: org.id, err: error }, 'entitlement refresh failed'),
      );
  }

  await withSystem('saas: used tokens', (tx) =>
    tx.delete(usedTokens).where(lt(usedTokens.expiresAt, sql`now()`)),
  );

  return refreshed;
};

/** Before installing: only plugins in the plan (402 with where to buy it). */
export const assertPluginInPlan = async (orgId: string, name: string) => {
  const access = accessOf(await entitlementsOf(orgId), name);

  if (access === 'off' || access === 'read_only') {
    throw new HttpError(402, 'NOT_IN_PLAN', `${name} is not in your plan`, {
      manageUrl: manageUrl(orgId),
    });
  }
};
