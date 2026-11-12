import type {
  PluginAccess,
  PluginPlan,
  SaasWorkspace,
  SubscriptionInfo,
} from '@erxes/core-contract';
import {
  type Db,
  entitlements,
  type EntitledPlugin,
  organizations,
  pluginInstallations,
  plugins,
  usedTokens,
  users,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, lt, ne, sql } from 'drizzle-orm';
import { createHash, timingSafeEqual } from 'node:crypto';
import { config } from '~/config';
import type { Actor, PluginCaller } from '~/http/auth';
import { HttpError, pgCode } from '~/http/errors';
import { log } from '~/lib/log';
import { recordAudit } from '~/modules/audit/audit.service';
import { subdomainFromHost } from '~/modules/auth/auth.service';
import { insertOrganization } from '~/modules/organizations/organizations.service';

type Row = typeof entitlements.$inferSelect;

/** Why an installation is off when the plugin left the plan (on again when it's bought again). */
export const NOT_IN_PLAN = 'Not in your plan';

const DAY = 24 * 60 * 60 * 1000;

/** erxes.io answers with `Cache-Control: max-age=30`: older than this, ask again (in the background). */
const FRESH_MS = 30_000;

const system = (orgId: string) => ({ orgId, actorType: 'system' as const, actorId: null });

// ─── Access ─────────────────────────────────────────────────────────────────

/** The organisation is turned off on erxes.io (`inactive` or `suspended`): nobody gets in. */
export const organizationDisabled = (row: Row | null | undefined) =>
  Boolean(config.saas.enabled && row && row.orgStatus !== 'active');

export const readOnlyUntil = (row: Row | null | undefined, code: string): Date | null => {
  const since = row?.lapsed[code];

  return since ? new Date(new Date(since).getTime() + config.saas.graceDays * DAY) : null;
};

/**
 * What a plugin may do in an organisation, from what erxes.io last said:
 * in the plan → `full` (`warning` while a payment retries or the plugin ends
 * at period end); left the plan → `read_only` for the grace days, then
 * `off`; never had it → `off`. Self-hosted, and organisations erxes.io
 * hasn't answered for yet, are `full`.
 */
export const accessOf = (
  row: Row | null | undefined,
  code: string,
  now = new Date(),
): PluginAccess => {
  if (!config.saas.enabled || !row) return 'full';

  const entry = row.plugins.find((plugin) => plugin.code === code);

  if (entry) return entry.status === 'active' ? 'full' : 'warning';

  const until = readOnlyUntil(row, code);

  return until && until > now ? 'read_only' : 'off';
};

/** The tier a plugin has here (self-hosted: everything, as Pro). */
export const tierOf = (row: Row | null | undefined, code: string) =>
  !config.saas.enabled
    ? 'pro'
    : (row?.plugins.find((plugin) => plugin.code === code)?.tier ?? (row ? null : 'pro'));

// ─── Reading erxes.io ──────────────────────────────────────────────────────

interface PlatformAnswer {
  status?: string;
  details?: { code: string; tier: string; status?: string }[];
  plugins?: Record<string, string>;
}

const TIERS = new Set(['free', 'plus', 'pro']);
const STATUSES = new Set(['active', 'past_due', 'canceling']);

/** `GET <platform>/api/platform/organizations/plugins?subdomain=` (Bearer), 10 s at most. */
const askPlatform = async (
  subdomain: string,
): Promise<{ orgStatus: Row['orgStatus']; plugins: EntitledPlugin[] } | null> => {
  const response = await fetch(
    `${config.saas.platformUrl}/api/platform/organizations/plugins?subdomain=${encodeURIComponent(subdomain)}`,
    {
      headers: { authorization: `Bearer ${config.saas.platformToken}`, accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (response.status === 404) return null;

  if (!response.ok) throw new Error(`erxes.io answered ${response.status}`);

  const body = (await response.json()) as PlatformAnswer;

  const details =
    body.details ??
    Object.entries(body.plugins ?? {}).map(([code, tier]) => ({ code, tier, status: 'active' }));

  return {
    orgStatus: body.status === 'suspended' || body.status === 'inactive' ? body.status : 'active',
    plugins: details
      .filter((item) => typeof item.code === 'string' && TIERS.has(item.tier))
      .map((item) => ({
        code: item.code,
        tier: item.tier as EntitledPlugin['tier'],
        status: (STATUSES.has(item.status ?? '')
          ? item.status
          : 'active') as EntitledPlugin['status'],
      })),
  };
};

/**
 * Plugins follow their access: in the plan and not installed → installed
 * (with the scopes they ask for); `off` → turned off with `NOT_IN_PLAN`
 * (data kept, tokens refused); bought again → on again. Read-only plugins
 * stay installed (their tokens can still read). Ones the owner uninstalled
 * stay uninstalled.
 */
export const reconcilePlugins = async (tx: Db, orgId: string, row: Row, now = new Date()) => {
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
const cache = new Map<string, { row: Row | null; at: number }>();
const inFlight = new Map<string, Promise<Row | null>>();

/**
 * Asks erxes.io what the organisation has and stores it: plugins that
 * disappeared are marked lapsed (read-only, then off), ones that came back
 * are cleared, installations follow. If erxes.io can't be reached the
 * stored answer stays in force. Changes are audited as the system.
 */
export const refreshEntitlements = (orgId: string): Promise<Row | null> => {
  const running = inFlight.get(orgId);

  if (running) return running;

  const run = (async () => {
    const [org] = await withSystem('saas: organisation', (tx) =>
      tx
        .select({ subdomain: organizations.subdomain, name: organizations.name })
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .limit(1),
    );

    if (!org) return null;

    subdomains.set(orgId, org.subdomain);

    let answer: Awaited<ReturnType<typeof askPlatform>>;

    try {
      answer = await askPlatform(org.subdomain);
    } catch (error) {
      log.warn('could not read entitlements from erxes.io; keeping the last answer', {
        org: orgId,
        error: (error as Error).message,
      });

      return withOrg(orgId, async (tx) => {
        const [row] = await tx
          .update(entitlements)
          .set({ lastError: (error as Error).message.slice(0, 300) })
          .where(eq(entitlements.orgId, orgId))
          .returning();

        return row ?? null;
      });
    }

    if (!answer) {
      log.warn('erxes.io does not know this organisation; keeping the last answer', {
        org: orgId,
        subdomain: org.subdomain,
      });

      return withOrg(
        orgId,
        async (tx) =>
          (await tx.select().from(entitlements).where(eq(entitlements.orgId, orgId)).limit(1))[0] ??
          null,
      );
    }

    return withOrg(orgId, async (tx) => {
      const [before] = await tx
        .select()
        .from(entitlements)
        .where(eq(entitlements.orgId, orgId))
        .for('update')
        .limit(1);

      const now = new Date();
      const codes = new Set(answer.plugins.map((plugin) => plugin.code));
      const lapsed: Record<string, string> = {};

      // Kept while still gone; new when it just left; cleared when it's back.
      for (const [code, since] of Object.entries(before?.lapsed ?? {}))
        if (!codes.has(code)) lapsed[code] = since;

      for (const plugin of before?.plugins ?? [])
        if (!codes.has(plugin.code) && !lapsed[plugin.code])
          lapsed[plugin.code] = now.toISOString();

      const values = {
        orgStatus: answer.orgStatus,
        plugins: answer.plugins,
        lapsed,
        fetchedAt: now,
        lastError: null,
      };

      const [row] = await tx
        .insert(entitlements)
        .values({ orgId, ...values })
        .onConflictDoUpdate({ target: entitlements.orgId, set: values })
        .returning();

      const changes = await reconcilePlugins(tx, orgId, row!, now);

      const describe = (list: EntitledPlugin[] = []) =>
        list
          .map((plugin) => `${plugin.code}:${plugin.tier}:${plugin.status}`)
          .sort()
          .join(',');

      if (
        !before ||
        describe(before.plugins) !== describe(row!.plugins) ||
        before.orgStatus !== row!.orgStatus ||
        changes.length
      ) {
        await recordAudit(tx, system(orgId), {
          action: 'saas.entitlements_changed',
          targetType: 'organization',
          targetId: orgId,
          targetLabel: org.name,
          metadata: {
            status: { before: before?.orgStatus ?? null, after: row!.orgStatus },
            plugins: { before: before?.plugins ?? null, after: row!.plugins },
            lapsed: row!.lapsed,
            installations: changes,
          },
        });
      }

      return row!;
    });
  })()
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
export const entitlementsOf = async (orgId: string): Promise<Row | null> => {
  if (!config.saas.enabled) return null;

  const hit = cache.get(orgId);

  if (hit && Date.now() - hit.at < FRESH_MS) return hit.row;

  const [row] = await withOrg(orgId, (tx) =>
    tx.select().from(entitlements).where(eq(entitlements.orgId, orgId)).limit(1),
  );

  if (row) {
    cache.set(orgId, { row, at: Date.now() });

    if (Date.now() - row.fetchedAt.getTime() > FRESH_MS)
      void refreshEntitlements(orgId).catch(() => undefined);

    return row;
  }

  return Promise.race([
    refreshEntitlements(orgId).catch(() => null),
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
      .catch((error: unknown) => log.warn('entitlement refresh failed', { org: org.id, error }));
  }

  await withSystem('saas: used tokens', (tx) =>
    tx.delete(usedTokens).where(lt(usedTokens.expiresAt, sql`now()`)),
  );

  return refreshed;
};

// ─── Enforcement ────────────────────────────────────────────────────────────

/** What members can still reach in a disabled organisation: their subscription and signing out. */
const DISABLED_ALLOWED = [/^\/plan$/, /^\/auth\/me$/, /^\/auth\/sign-out$/];

/**
 * After authentication: a disabled organisation (erxes.io `inactive` or
 * `suspended`) lets nobody in; a plugin that is `off` is refused, and a
 * `read_only` one can read but not change anything in core (402).
 */
export const standingGuard = (
  req: { method: string; path: string; actor?: Actor; plugin?: PluginCaller },
  _res: unknown,
  next: (error?: unknown) => void,
) => {
  if (!config.saas.enabled) return next();

  const orgId = req.actor?.orgId ?? req.plugin?.orgId;

  if (!orgId) return next();

  entitlementsOf(orgId)
    .then((row) => {
      if (
        organizationDisabled(row) &&
        !(req.actor && DISABLED_ALLOWED.some((pattern) => pattern.test(req.path)))
      ) {
        return next(
          new HttpError(403, 'ORGANIZATION_DISABLED', 'This organisation is disabled on erxes.io', {
            manageUrl: manageUrl(orgId),
          }),
        );
      }

      if (req.plugin) {
        const access = accessOf(row, req.plugin.plugin);

        if (access === 'off')
          return next(
            new HttpError(
              403,
              'NOT_IN_PLAN',
              `${req.plugin.plugin} is not in this organisation's plan`,
            ),
          );

        if (access === 'read_only' && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
          return next(
            new HttpError(
              402,
              'READ_ONLY',
              `${req.plugin.plugin} left the plan: read-only until it is bought again`,
            ),
          );
        }
      }

      return next();
    })
    .catch(next);
};

/** Subdomains seen while refreshing, for the billing link (`SAAS_BILLING_URL` with `{subdomain}`). */
const subdomains = new Map<string, string>();

const manageUrl = (orgId: string) => {
  if (!config.saas.billingUrl.includes('{subdomain}')) return config.saas.billingUrl;

  const subdomain = subdomains.get(orgId);

  return subdomain ? config.saas.billingUrl.replace('{subdomain}', subdomain) : null;
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

// ─── erxes.io → core ───────────────────────────────────────────────────────

/** `Authorization: Bearer <SAAS_PLATFORM_TOKEN>`: erxes.io calling core. */
export const platformAuthorized = (header: string | undefined) => {
  const token = config.saas.platformToken;
  const given = header?.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token || !given) return false;

  const a = Buffer.from(token);
  const b = Buffer.from(given);

  return a.length === b.length && timingSafeEqual(a, b);
};

/** Creates the workspace (organisation and owner) the first time; renames, enables or disables it after. Then reads its plugins. */
export const applyWorkspace = async (orgId: string, input: SaasWorkspace) => {
  const created = await withSystem('saas: workspace', async (tx) => {
    const [org] = await tx
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .for('update')
      .limit(1);

    try {
      if (!org) {
        if (!input.owner)
          throw new HttpError(400, 'OWNER_REQUIRED', 'A new workspace needs its owner');

        await insertOrganization(tx, {
          id: orgId,
          subdomain: input.organization.subdomain,
          name: input.organization.name,
          owner: input.owner,
        });
      } else if (
        org.subdomain !== input.organization.subdomain ||
        org.name !== input.organization.name
      ) {
        await tx
          .update(organizations)
          .set({
            subdomain: input.organization.subdomain,
            name: input.organization.name,
            updatedAt: sql`now()`,
          })
          .where(eq(organizations.id, orgId));
      }
    } catch (error) {
      if (pgCode(error) === '23505')
        throw new HttpError(409, 'SUBDOMAIN_TAKEN', 'Another workspace has this subdomain');
      throw error;
    }

    if (input.status) {
      const values = { orgStatus: input.status, fetchedAt: new Date(0) };

      await tx
        .insert(entitlements)
        .values({ orgId, ...values })
        .onConflictDoUpdate({ target: entitlements.orgId, set: { orgStatus: input.status } });
    }

    return !org;
  });

  cache.delete(orgId);
  const row = await refreshEntitlements(orgId);

  return {
    created,
    organizationStatus: row?.orgStatus ?? input.status ?? 'active',
    plugins: row?.plugins ?? [],
  };
};

/** What erxes.io may read back: the workspace and its usage. */
export const workspaceUsage = (orgId: string) =>
  withSystem('saas: usage', async (tx) => {
    const [org] = await tx.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);

    if (!org) throw new HttpError(404, 'NOT_FOUND', 'No such workspace');

    const [row] = await tx
      .select()
      .from(entitlements)
      .where(eq(entitlements.orgId, orgId))
      .limit(1);

    const [{ members } = { members: 0 }] = await tx
      .select({ members: sql<number>`count(*)::int` })
      .from(users)
      .where(and(eq(users.orgId, orgId), ne(users.status, 'disabled'), eq(users.isSupport, false)));

    const installed = await tx
      .select({
        plugin: pluginInstallations.plugin,
        status: pluginInstallations.status,
        statusReason: pluginInstallations.statusReason,
      })
      .from(pluginInstallations)
      .where(eq(pluginInstallations.orgId, orgId));

    return {
      id: org.id,
      subdomain: org.subdomain,
      name: org.name,
      organizationStatus: row?.orgStatus ?? 'active',
      checkedAt: row && row.fetchedAt.getTime() > 0 ? row.fetchedAt.toISOString() : null,
      usage: { teamMembers: members },
      plugins: installed,
    };
  });

// ─── What members and plugins see ──────────────────────────────────────────

export const subscriptionInfo = async (client: Db, actor: Actor): Promise<SubscriptionInfo> => {
  const row = await entitlementsOf(actor.orgId);

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

  if (org) subdomains.set(actor.orgId, org.subdomain);

  const registered = await client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins);

  const active = new Set(
    (
      await client
        .select({ plugin: pluginInstallations.plugin })
        .from(pluginInstallations)
        .where(
          and(eq(pluginInstallations.orgId, actor.orgId), eq(pluginInstallations.status, 'active')),
        )
    ).map((item) => item.plugin),
  );

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
        title: registered.find((item) => item.name === code)?.manifest?.title ?? code,
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

// ─── Sign-in hand-off from erxes.io ────────────────────────────────────────

/**
 * erxes.io's "open workspace" link: `…/core-login?token=` with an HS256
 * token signed with SAAS_JWT_TOKEN_SECRET (erxes.io's `workspaceUrl`):
 * `{ user: { email } }` (or `email`), at most 5 minutes old. The
 * organisation is the token's `org`, else the address's subdomain. Each
 * token works once.
 */
export const redeemHandoff = async (token: string, host: string | undefined) => {
  if (!config.saas.handoffSecret)
    throw new HttpError(404, 'NOT_FOUND', 'Sign-in hand-off is not set up');

  const { jwtVerify } = await import('jose');

  const { payload } = await jwtVerify(token, new TextEncoder().encode(config.saas.handoffSecret), {
    algorithms: ['HS256'],
    maxTokenAge: '5m',
  });

  const claims = payload as {
    user?: { email?: unknown };
    email?: unknown;
    org?: unknown;
    exp?: number;
  };

  const email =
    typeof claims.user?.email === 'string'
      ? claims.user.email
      : typeof claims.email === 'string'
        ? claims.email
        : null;

  if (!email || !claims.exp) throw new HttpError(400, 'INVALID_TOKEN', 'Not a sign-in link');

  const subdomain = subdomainFromHost(host) ?? config.auth.defaultSubdomain;

  const [org] = await withSystem('saas: hand-off organisation', (tx) =>
    tx
      .select({ id: organizations.id })
      .from(organizations)
      .where(
        typeof claims.org === 'string'
          ? eq(organizations.id, claims.org)
          : eq(sql`lower(${organizations.subdomain})`, (subdomain ?? '').toLowerCase()),
      )
      .limit(1),
  );

  if (!org) throw new HttpError(404, 'NOT_FOUND', 'No such workspace');

  // erxes.io's tokens carry no id: the token itself (hashed) is what can't be used twice.
  const used = await withSystem('saas: hand-off', (tx) =>
    tx
      .insert(usedTokens)
      .values({
        jti: `saas:${createHash('sha256').update(token).digest('base64url')}`,
        expiresAt: new Date(claims.exp! * 1000),
      })
      .onConflictDoNothing()
      .returning({ jti: usedTokens.jti }),
  );

  if (!used.length) throw new HttpError(400, 'TOKEN_USED', 'This sign-in link was already used');

  const [user] = await withOrg(org.id, (tx) =>
    tx
      .select({ id: users.id, status: users.status })
      .from(users)
      .where(
        and(
          eq(users.orgId, org.id),
          eq(sql`lower(${users.email})`, email.toLowerCase()),
          ne(users.status, 'disabled'),
        ),
      )
      .limit(1),
  );

  if (!user) throw new HttpError(403, 'NOT_A_MEMBER', 'You are not a member of this workspace');

  await withOrg(org.id, async (tx) => {
    // erxes.io vouches for the email: an invited member becomes active.
    if (user.status === 'invited')
      await tx
        .update(users)
        .set({ status: 'active', updatedAt: sql`now()` })
        .where(eq(users.id, user.id));

    await recordAudit(
      tx,
      { orgId: org.id, actorType: 'user', actorId: user.id, source: 'core' },
      {
        action: 'auth.signed_in',
        targetType: 'user',
        targetId: user.id,
        targetLabel: email,
        metadata: { method: 'erxes_io' },
      },
    );
  });

  return { orgId: org.id, userId: user.id };
};
