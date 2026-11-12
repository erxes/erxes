import type { PlanInfo, PluginPlan, SaasOrganizationUpdate, Standing } from '@erxes/core-contract';
import {
  type Db,
  organizationPlans,
  organizations,
  pluginInstallations,
  plugins,
  usedTokens,
  users,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, inArray, lt, ne, sql } from 'drizzle-orm';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '~/config';
import type { Actor, PluginCaller } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { lockOrganization } from '~/lib/locks';
import { log } from '~/lib/log';
import { recordAudit } from '~/modules/audit/audit.service';
import { insertOrganization } from '~/modules/organizations/organizations.service';

type PlanRow = typeof organizationPlans.$inferSelect;

/** Why an installation is off when the plan dropped the plugin (it comes back when the plan has it again). */
export const NOT_IN_PLAN = 'Not in your plan';

const DAY = 24 * 60 * 60 * 1000;

const system = (orgId: string) => ({ orgId, actorType: 'system' as const, actorId: null });

// ─── Standing ───────────────────────────────────────────────────────────────

/** When changes stop working if nothing is paid: the plan's grace date, or the period end plus the grace days. */
const readOnlyAt = (row: PlanRow): Date | null => {
  if (row.status === 'trialing' || row.status === 'active') return null;
  if (row.graceUntil) return row.graceUntil;
  if (row.currentPeriodEnd) return new Date(row.currentPeriodEnd.getTime() + config.saas.graceDays * DAY);

  return null;
};

/**
 * Where an organisation stands, from its plan: suspended; read-only once an
 * unpaid, canceled or expired plan is past its grace; a warning before that;
 * otherwise ok. Self-hosted (and organisations the control plane hasn't
 * described yet) are always ok.
 */
export const standingOf = (row: PlanRow | null | undefined, now = new Date()): { standing: Standing; readOnlyAt: Date | null } => {
  if (!config.saas.enabled || !row) return { standing: 'ok', readOnlyAt: null };
  if (row.suspended) return { standing: 'suspended', readOnlyAt: null };

  const at = readOnlyAt(row);

  if (row.status === 'trialing' || row.status === 'active') return { standing: 'ok', readOnlyAt: null };
  // Canceled or past due: nothing changes until then; with no date at all, it's over.
  if (!at || at <= now) return { standing: 'read_only', readOnlyAt: at };

  return { standing: 'warning', readOnlyAt: at };
};

/** Plans read on every request: kept 30 s per process, dropped at once when this process applies an update. */
const cache = new Map<string, { row: PlanRow | null; at: number }>();
const CACHE_MS = 30_000;

export const planOf = async (orgId: string): Promise<PlanRow | null> => {
  if (!config.saas.enabled) return null;

  const hit = cache.get(orgId);

  if (hit && Date.now() - hit.at < CACHE_MS) return hit.row;

  const [row] = await withOrg(orgId, (tx) => tx.select().from(organizationPlans).where(eq(organizationPlans.orgId, orgId)).limit(1));

  cache.set(orgId, { row: row ?? null, at: Date.now() });

  return row ?? null;
};

export const forgetPlan = (orgId: string) => cache.delete(orgId);

/** In the plan now (self-hosted, or not described by the control plane yet: everything is). */
export const pluginIncluded = (row: PlanRow | null, name: string, now = new Date()) => {
  if (!config.saas.enabled || !row) return true;

  return row.plugins.some((plugin) => plugin.name === name && (!plugin.until || new Date(plugin.until) > now));
};

// ─── Enforcement ────────────────────────────────────────────────────────────

/** Changes allowed even when read-only: signing in and out, one's own security, reading notifications. */
const ALWAYS_ALLOWED = [/^\/auth\//, /^\/notifications(\/|$)/, /^\/plan(\/|$)/];

/**
 * After authentication (members and plugins): a suspended organisation gets
 * nothing but its plan and sign-out; a read-only one can read and export but
 * not change anything (402, so the UI can show why).
 */
export const standingGuard = (req: { method: string; path: string; actor?: Actor; plugin?: PluginCaller }, _res: unknown, next: (error?: unknown) => void) => {
  if (!config.saas.enabled) return next();

  const orgId = req.actor?.orgId ?? req.plugin?.orgId;

  if (!orgId) return next();

  planOf(orgId)
    .then((row) => {
      const { standing } = standingOf(row);
      const allowed = ALWAYS_ALLOWED.some((pattern) => pattern.test(req.path));

      if (standing === 'suspended' && !(req.actor && allowed && (req.method === 'GET' || req.path === '/auth/sign-out'))) {
        return next(new HttpError(403, 'ORGANIZATION_SUSPENDED', row?.suspendedReason ?? 'This organisation is suspended'));
      }

      if (standing === 'read_only' && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !(req.actor && allowed)) {
        return next(
          new HttpError(402, 'READ_ONLY', 'The subscription has ended: renew it to make changes', { manageUrl: row?.manageUrl ?? null }),
        );
      }

      return next();
    })
    .catch(next);
};

/** Before installing: only plugins in the plan (402 with where to add it). */
export const assertPluginInPlan = async (orgId: string, name: string) => {
  const row = await planOf(orgId);

  if (!pluginIncluded(row, name)) {
    throw new HttpError(402, 'NOT_IN_PLAN', `${name} is not in your plan`, { manageUrl: row?.manageUrl ?? null });
  }
};

const seatsUsed = async (client: Db, orgId: string) => {
  const [{ count } = { count: 0 }] = await client
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.orgId, orgId), inArray(users.status, ['active', 'invited']), eq(users.isSupport, false)));

  return count;
};

/**
 * Before adding team members (invite, enable): within the plan's
 * `teamMembers` (active and invited, support accounts not counted). Locks
 * the organisation, so two invitations can't both take the last seat.
 */
export const assertSeats = async (client: Db, orgId: string, adding: number) => {
  if (!config.saas.enabled || adding <= 0) return;

  const row = await planOf(orgId);
  const limit = row?.limits.teamMembers;

  if (limit === null || limit === undefined) return;

  await lockOrganization(client, orgId);

  const used = await seatsUsed(client, orgId);

  if (used + adding > limit) {
    throw new HttpError(402, 'LIMIT_REACHED', `Your plan has ${limit} team members (${used} used)`, {
      key: 'teamMembers',
      limit,
      used,
      manageUrl: row?.manageUrl ?? null,
    });
  }
};

// ─── Sync from the control plane ────────────────────────────────────────────

/** `Erxes-Signature: t=<unix s>,v1=<hex HMAC-SHA256(SAAS_SECRET, "<t>.<body>")>`, at most 5 minutes old. */
export const verifySaasSignature = (header: string | undefined, body: string, now = Date.now()) => {
  const match = /t=(\d+),v1=([0-9a-f]{64})/.exec(header ?? '');

  if (!config.saas.secret || !match) return false;

  const [, t, given] = match;

  if (Math.abs(now / 1000 - Number(t)) > 300) return false;

  const expected = createHmac('sha256', config.saas.secret).update(`${t}.${body}`).digest('hex');

  return timingSafeEqual(Buffer.from(given!), Buffer.from(expected));
};

/**
 * Plugins follow the plan: in the plan and not installed → installed (with
 * the scopes they ask for); taken out → turned off with `NOT_IN_PLAN` (data
 * kept); back in → on again. Ones the owner uninstalled stay uninstalled.
 */
export const reconcilePlugins = async (tx: Db, orgId: string, row: PlanRow, now = new Date()) => {
  const registered = await tx.select({ name: plugins.name, manifest: plugins.manifest }).from(plugins).where(eq(plugins.status, 'active'));
  const installed = new Map(
    (await tx.select().from(pluginInstallations).where(eq(pluginInstallations.orgId, orgId))).map((item) => [item.plugin, item]),
  );
  const changes: { plugin: string; change: 'installed' | 'resumed' | 'removed' }[] = [];

  for (const plugin of registered) {
    const included = pluginIncluded(row, plugin.name, now);
    const installation = installed.get(plugin.name);

    if (included && !installation) {
      await tx
        .insert(pluginInstallations)
        .values({ orgId, plugin: plugin.name, grantedScopes: plugin.manifest?.scopes ?? [] })
        .onConflictDoNothing();
      changes.push({ plugin: plugin.name, change: 'installed' });
    } else if (included && installation?.status === 'disabled' && installation.statusReason === NOT_IN_PLAN) {
      await tx
        .update(pluginInstallations)
        .set({ status: 'active', statusReason: null, updatedAt: sql`now()` })
        .where(and(eq(pluginInstallations.orgId, orgId), eq(pluginInstallations.plugin, plugin.name)));
      changes.push({ plugin: plugin.name, change: 'resumed' });
    } else if (!included && installation?.status === 'active') {
      await tx
        .update(pluginInstallations)
        .set({ status: 'disabled', statusReason: NOT_IN_PLAN, updatedAt: sql`now()` })
        .where(and(eq(pluginInstallations.orgId, orgId), eq(pluginInstallations.plugin, plugin.name)));
      changes.push({ plugin: plugin.name, change: 'removed' });
    }
  }

  return changes;
};

const toDate = (value: string | null | undefined) => (value ? new Date(value) : null);

/**
 * Applies the control plane's view of one organisation: creates it the
 * first time (with its owner), renames it, stores the plan, and brings
 * plugins in line. Row-locked and versioned: concurrent or late updates
 * can't put an older plan back. Audited as the system.
 */
export const applySaasUpdate = async (orgId: string, input: SaasOrganizationUpdate) => {
  const result = await withSystem('saas: organization update', async (tx) => {
    const [org] = await tx.select().from(organizations).where(eq(organizations.id, orgId)).for('update').limit(1);

    if (!org) {
      if (!input.owner) throw new HttpError(400, 'OWNER_REQUIRED', 'A new organisation needs its owner');

      await insertOrganization(tx, { id: orgId, subdomain: input.organization.subdomain, name: input.organization.name, owner: input.owner });
    } else if (org.subdomain !== input.organization.subdomain || org.name !== input.organization.name) {
      await tx
        .update(organizations)
        .set({ subdomain: input.organization.subdomain, name: input.organization.name, updatedAt: sql`now()` })
        .where(eq(organizations.id, orgId));
    }

    const [before] = await tx.select().from(organizationPlans).where(eq(organizationPlans.orgId, orgId)).for('update').limit(1);

    if (before && before.version >= input.version) return { applied: false as const, created: !org };

    const values = {
      plan: input.subscription.plan,
      planName: input.subscription.planName ?? null,
      status: input.subscription.status,
      currentPeriodEnd: toDate(input.subscription.currentPeriodEnd),
      graceUntil: toDate(input.subscription.graceUntil),
      suspended: input.suspended,
      suspendedReason: input.suspended ? (input.suspendedReason ?? null) : null,
      plugins: input.plugins.map((plugin) => ({ name: plugin.name, until: plugin.until ?? null, limits: plugin.limits ?? {} })),
      limits: input.limits,
      manageUrl: input.manageUrl ?? null,
      version: input.version,
      syncedAt: new Date(),
    };
    const [row] = await tx
      .insert(organizationPlans)
      .values({ orgId, ...values })
      .onConflictDoUpdate({ target: organizationPlans.orgId, set: values })
      .returning();
    const changes = await reconcilePlugins(tx, orgId, row!);

    await recordAudit(tx, system(orgId), {
      action: 'saas.plan_updated',
      targetType: 'organization',
      targetId: orgId,
      targetLabel: input.organization.name,
      metadata: {
        version: input.version,
        plan: { before: before?.plan ?? null, after: row!.plan },
        status: { before: before?.status ?? null, after: row!.status },
        suspended: row!.suspended,
        plugins: changes,
        limits: row!.limits,
      },
    });

    return { applied: true as const, created: !org, plugins: changes };
  });

  forgetPlan(orgId);

  return result;
};

/** What the control plane may read back: usage for billing, and what core holds. */
export const saasUsage = (orgId: string) =>
  withSystem('saas: usage', async (tx) => {
    const [org] = await tx.select().from(organizations).where(eq(organizations.id, orgId)).limit(1);

    if (!org) throw new HttpError(404, 'NOT_FOUND', 'No such organisation');

    const [plan] = await tx.select().from(organizationPlans).where(eq(organizationPlans.orgId, orgId)).limit(1);
    const installed = await tx
      .select({ plugin: pluginInstallations.plugin, status: pluginInstallations.status, statusReason: pluginInstallations.statusReason })
      .from(pluginInstallations)
      .where(eq(pluginInstallations.orgId, orgId));
    const [activity] = await tx
      .select({ lastSignInAt: sql<string | null>`max(created_at)` })
      .from(sql`core_audit_logs`)
      .where(sql`org_id = ${orgId} and action = 'auth.signed_in'`);

    return {
      id: org.id,
      subdomain: org.subdomain,
      name: org.name,
      version: plan?.version ?? null,
      standing: standingOf(plan).standing,
      usage: { teamMembers: await seatsUsed(tx, orgId) },
      plugins: installed,
      lastSignInAt: activity?.lastSignInAt ?? null,
    };
  });

/** Hourly: plugins whose `until` passed are turned off without waiting for the next update. */
export const reconcileExpiredPlugins = async () => {
  if (!config.saas.enabled) return 0;

  const rows = await withSystem('saas: plans', (tx) =>
    tx.select().from(organizationPlans).where(sql`exists (select 1 from jsonb_array_elements(${organizationPlans.plugins}) p where p->>'until' is not null)`),
  );
  let changed = 0;

  for (const row of rows) {
    const changes = await withOrg(row.orgId, (tx) => reconcilePlugins(tx, row.orgId, row));

    if (changes.length) {
      changed += changes.length;
      forgetPlan(row.orgId);
      log.info('plugins left the plan at the end of their period', { org: row.orgId, changes });
    }
  }

  await withSystem('saas: used tokens', (tx) => tx.delete(usedTokens).where(lt(usedTokens.expiresAt, sql`now()`)));

  return changed;
};

// ─── What members and plugins see ──────────────────────────────────────────

export const planInfo = async (client: Db, actor: Actor): Promise<PlanInfo> => {
  const row = await planOf(actor.orgId);
  const { standing, readOnlyAt: at } = standingOf(row);

  if (!config.saas.enabled || !row) {
    return {
      saas: config.saas.enabled,
      standing,
      plan: null,
      planName: null,
      status: null,
      currentPeriodEnd: null,
      readOnlyAt: null,
      suspendedReason: null,
      plugins: [],
      limits: [],
      manageUrl: null,
    };
  }

  const names = row.plugins.map((plugin) => plugin.name);
  const registered = names.length ? await client.select({ name: plugins.name, manifest: plugins.manifest }).from(plugins).where(inArray(plugins.name, names)) : [];
  const installed = new Set(
    (
      await client
        .select({ plugin: pluginInstallations.plugin })
        .from(pluginInstallations)
        .where(and(eq(pluginInstallations.orgId, actor.orgId), eq(pluginInstallations.status, 'active')))
    ).map((item) => item.plugin),
  );
  const used: Record<string, number> = { teamMembers: await seatsUsed(client, actor.orgId) };

  return {
    saas: true,
    standing,
    plan: row.plan,
    planName: row.planName,
    status: row.status,
    currentPeriodEnd: row.currentPeriodEnd?.toISOString() ?? null,
    readOnlyAt: at?.toISOString() ?? null,
    suspendedReason: row.suspendedReason,
    plugins: row.plugins
      .filter((plugin) => !plugin.until || new Date(plugin.until) > new Date())
      .map((plugin) => ({
        name: plugin.name,
        title: registered.find((item) => item.name === plugin.name)?.manifest?.title ?? plugin.name,
        until: plugin.until ?? null,
        installed: installed.has(plugin.name),
      })),
    limits: Object.entries(row.limits).map(([key, limit]) => ({ key, limit, used: used[key] ?? null })),
    manageUrl: row.manageUrl,
  };
};

/** For a plugin: whether it's in the plan, and its own limits (`limits` on its plan entry, plus `<plugin>.*` organisation limits). */
export const pluginPlan = async (caller: PluginCaller): Promise<PluginPlan> => {
  const row = await planOf(caller.orgId);
  const { standing } = standingOf(row);
  const entry = row?.plugins.find((plugin) => plugin.name === caller.plugin);
  const prefixed = Object.fromEntries(
    Object.entries(row?.limits ?? {})
      .filter(([key]) => key.startsWith(`${caller.plugin}.`))
      .map(([key, value]) => [key.slice(caller.plugin.length + 1), value]),
  );

  return {
    saas: config.saas.enabled,
    standing,
    plan: row?.plan ?? null,
    included: pluginIncluded(row, caller.plugin),
    until: entry?.until ?? null,
    limits: { ...prefixed, ...(entry?.limits ?? {}) },
  };
};

// ─── Sign-in hand-off from the dashboard ───────────────────────────────────

/**
 * `GET /core/v1/saas/login?token=…`: the dashboard (erxes.io) sends a member
 * here with a short-lived HS256 token signed with SAAS_SECRET — `iss`
 * erxes-saas, `aud` erxes-core, `org`, `email`, `jti`, at most 2 minutes —
 * and core signs them in. Each token works once.
 */
export const redeemHandoff = async (token: string) => {
  const { jwtVerify } = await import('jose');
  const { payload } = await jwtVerify(token, new TextEncoder().encode(config.saas.secret ?? ''), {
    issuer: 'erxes-saas',
    audience: 'erxes-core',
    algorithms: ['HS256'],
    maxTokenAge: '2m',
  });
  const { org, email, jti, exp } = payload as { org?: unknown; email?: unknown; jti?: unknown; exp?: number };

  if (typeof org !== 'string' || typeof email !== 'string' || typeof jti !== 'string' || !exp) {
    throw new HttpError(400, 'INVALID_TOKEN', 'Not a sign-in link');
  }

  const used = await withSystem('saas: hand-off', (tx) =>
    tx
      .insert(usedTokens)
      .values({ jti: `saas:${jti}`, expiresAt: new Date(exp * 1000) })
      .onConflictDoNothing()
      .returning({ jti: usedTokens.jti }),
  );

  if (!used.length) throw new HttpError(400, 'TOKEN_USED', 'This sign-in link was already used');

  const [user] = await withOrg(org, (tx) =>
    tx
      .select({ id: users.id, status: users.status })
      .from(users)
      .where(and(eq(users.orgId, org), eq(sql`lower(${users.email})`, email.toLowerCase()), ne(users.status, 'disabled')))
      .limit(1),
  );

  if (!user) throw new HttpError(403, 'NOT_A_MEMBER', 'You are not a member of this organisation');

  // The dashboard vouches for the email: an invited member becomes active.
  if (user.status === 'invited') {
    await withOrg(org, (tx) => tx.update(users).set({ status: 'active', updatedAt: sql`now()` }).where(eq(users.id, user.id)));
  }

  await withOrg(org, (tx) =>
    recordAudit(tx, { orgId: org, actorType: 'user', actorId: user.id, source: 'core' }, {
      action: 'auth.signed_in',
      targetType: 'user',
      targetId: user.id,
      targetLabel: email,
      metadata: { method: 'saas_handoff' },
    }),
  );

  return { orgId: org, userId: user.id };
};
