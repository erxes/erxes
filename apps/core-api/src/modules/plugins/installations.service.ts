import type { Plugin } from '@erxes/core-contract';
import { type Db, db, pluginInstallations, plugins } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { type Actor, type PluginCaller, userCaller } from '~/http/auth';
import { can } from '~/http/access';
import { HttpError } from '~/http/errors';
import { signJwt } from '~/lib/signing';
import { recordAudit } from '~/modules/audit/audit.service';
import { accessOf, tierOf } from '~/modules/saas/access';
import { assertPluginInPlan, entitlementsOf } from '~/modules/saas/entitlements';
import { textArray } from '~/modules/views/filterValues';
import { requestedScopes } from './plugins.service';

/** Plugin UI tokens: a member's session for one plugin's API. */
const PLUGIN_SESSION_TTL_SECONDS = 5 * 60;
const PLUGIN_SESSION_TYP = 'erxes-plugin-session+jwt';

const toPluginDto = (
  row: typeof plugins.$inferSelect,
  installation?: typeof pluginInstallations.$inferSelect | null,
): Plugin => {
  const requested = requestedScopes(row);
  const installed = installation?.status === 'active';
  const granted = installed ? installation.grantedScopes : [];

  return {
    name: row.name,
    title: row.manifest?.title ?? row.name,
    version: row.manifest?.version ?? null,
    description: row.manifest?.description ?? null,
    countries: row.manifest?.countries ?? [],
    ui: row.manifest?.ui ?? null,
    api: row.manifest?.api ?? null,
    installed,
    statusReason: installation?.statusReason ?? null,
    requestedScopes: requested,
    grantedScopes: granted,
    needsApproval: installed && requested.some((scope) => !granted.includes(scope)),
    installedAt: installed ? installation.installedAt.toISOString() : null,
  };
};

export const listPlugins = async (actor: Actor) => {
  const rows = await wholeList((limit) =>
    db()
      .select({ plugin: plugins, installation: pluginInstallations })
      .from(plugins)
      .leftJoin(
        pluginInstallations,
        and(
          eq(pluginInstallations.plugin, plugins.name),
          eq(pluginInstallations.orgId, actor.orgId),
        ),
      )
      .where(eq(plugins.status, 'active'))
      .orderBy(plugins.name)
      .limit(limit),
  );

  return { data: rows.map((row) => toPluginDto(row.plugin, row.installation)) };
};

const pluginOrThrow = async (client: Db, name: string) => {
  const [row] = await client
    .select()
    .from(plugins)
    .where(and(eq(plugins.name, name), eq(plugins.status, 'active')))
    .limit(1);

  if (!row) throw new HttpError(404, 'PLUGIN_NOT_FOUND', 'No such plugin');

  return row;
};

const installPluginTx = async (actor: Actor, name: string) => {
  const tx = db();

  const row = await pluginOrThrow(tx, name);
  const scopes = requestedScopes(row);

  const [before] = await tx
    .select()
    .from(pluginInstallations)
    .where(and(eq(pluginInstallations.orgId, actor.orgId), eq(pluginInstallations.plugin, name)))
    .limit(1);

  const [installation] = await tx
    .insert(pluginInstallations)
    .values({
      orgId: actor.orgId,
      plugin: name,
      grantedScopes: scopes,
      installedBy: actor.userId,
    })
    .onConflictDoUpdate({
      target: [pluginInstallations.orgId, pluginInstallations.plugin],
      set: {
        status: 'active',
        statusReason: null,
        grantedScopes: scopes,
        installedBy: actor.userId,
        updatedAt: sql`now()`,
        installedAt: before?.status === 'active' ? before.installedAt : sql`now()`,
      },
    })
    .returning();

  await recordAudit(tx, userCaller(actor), {
    action: before?.status === 'active' ? 'plugin.scopes_approved' : 'plugin.installed',
    targetType: 'plugin',
    targetId: name,
    targetLabel: row.manifest?.title ?? name,
    changes: { scopes: [before?.status === 'active' ? before.grantedScopes : [], scopes] },
  });

  return toPluginDto(row, installation);
};

/** Installs a plugin, or grants the scopes a newer version asks for. */
export const installPlugin = async (actor: Actor, name: string) => {
  await assertPluginInPlan(actor.orgId, name);

  return installPluginTx(actor, name);
};

/** Uninstalls: tokens stop working on the next request. Data stays in the plugin. */
export const uninstallPlugin = async (actor: Actor, name: string) => {
  const tx = db();

  const row = await pluginOrThrow(tx, name);

  const [installation] = await tx
    .update(pluginInstallations)
    .set({ status: 'disabled', updatedAt: sql`now()` })
    .where(and(eq(pluginInstallations.orgId, actor.orgId), eq(pluginInstallations.plugin, name)))
    .returning();

  if (!installation) throw new HttpError(404, 'NOT_INSTALLED', `${name} is not installed`);

  await recordAudit(tx, userCaller(actor), {
    action: 'plugin.uninstalled',
    targetType: 'plugin',
    targetId: name,
    targetLabel: row.manifest?.title ?? name,
  });

  return toPluginDto(row, installation);
};

/**
 * A member's 5-minute token for one plugin's API: the plugin verifies it with
 * core's public keys (JWKS), never sees core's session cookie, and can't use
 * it anywhere else (`aud` is the plugin).
 */
export const pluginSession = async (actor: Actor, name: string) => {
  const [row] = await db()
    .select({ plugin: plugins, installation: pluginInstallations })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(
      and(
        eq(plugins.name, name),
        eq(plugins.status, 'active'),
        eq(pluginInstallations.orgId, actor.orgId),
        eq(pluginInstallations.status, 'active'),
      ),
    )
    .limit(1);

  if (!row)
    throw new HttpError(403, 'NOT_INSTALLED', `${name} is not installed in this organisation`);

  // SaaS: the plugin's tier here (gate Plus/Pro features) and whether it may change anything.
  const plan = await entitlementsOf(actor.orgId);
  const access = accessOf(plan, name);

  if (access === 'off') throw new HttpError(402, 'NOT_IN_PLAN', `${name} is not in your plan`);

  // The member's permissions within this plugin (`hr.leave.approve`, …), for its API to check.
  const permissions = (row.plugin.manifest?.permissions ?? [])
    .map((permission) => permission.action)
    .filter((action) => can(actor, action));

  const token = await signJwt(
    { org: actor.orgId, role: actor.role, permissions, tier: tierOf(plan, name), access },
    {
      typ: PLUGIN_SESSION_TYP,
      audience: name,
      subject: actor.userId,
      expiresInSeconds: PLUGIN_SESSION_TTL_SECONDS,
    },
  );

  return {
    token,
    expiresAt: new Date(Date.now() + PLUGIN_SESSION_TTL_SECONDS * 1000).toISOString(),
    apiUrl: row.plugin.manifest?.api?.url ?? null,
  };
};

/** Live signals to the plugin's open UIs (sent on commit, like core's). */
export const pluginSignal = async (
  caller: PluginCaller,
  input: { topics: string[]; userIds?: string[] },
) => {
  if (input.topics.length)
    await db().execute(
      sql`select core_live_signal(${caller.orgId}, ${caller.plugin}, topic, ${input.userIds?.length ? textArray(input.userIds) : sql`null::text[]`}) from unnest(${textArray(input.topics)}) as topic`,
    );

  return { ok: true as const };
};
