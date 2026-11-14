import { PLUGIN_SCOPES } from '@erxes/core-contract';
import { caller, type Db, db, pluginInstallations, plugins, requestOrgId } from '@erxes/core-db';
import { and, eq, type SQL, sql } from 'drizzle-orm';
import { wholeList } from '~/lib/keyset';
import { oneRow } from '~/lib/rows';
import { can } from '~/http/access';
import { fail } from '~/http/errors';
import { signJwt } from '~/lib/signing';
import { recordAudit } from '~/modules/audit/audit.service';
import { accessOf, tierOf } from '~/modules/saas/access';
import { assertPluginInPlan, entitlementsOf } from '~/modules/saas/entitlements';
import { textArray } from '~/modules/views/filterValues';
import { requestedScopes } from './plugins.service';

/** Plugin UI tokens: a member's session for one plugin's API. */
const PLUGIN_SESSION_TTL_SECONDS = 5 * 60;
const PLUGIN_SESSION_TYP = 'erxes-plugin-session+jwt';

/** `requestedScopes()` in SQL. */
const requested = sql<string[]>`case when ${plugins.manifest} ? 'scopes'
  then array(select jsonb_array_elements_text(${plugins.manifest} -> 'scopes'))
  else ${textArray([...PLUGIN_SCOPES])} end`;

/** Active plugins with this organisation's installation, as members see them. */
const selectPlugins = (client: Db, where?: SQL) =>
  client
    .select({
      name: plugins.name,
      manifest: plugins.manifest,
      installation: {
        status: pluginInstallations.status,
        statusReason: pluginInstallations.statusReason,
        grantedScopes: pluginInstallations.grantedScopes,
        installedAt: pluginInstallations.installedAt,
      },
      requestedScopes: requested,
      needsApproval: sql<boolean>`coalesce(${pluginInstallations.status} = 'active'
        and not ${requested} <@ ${pluginInstallations.grantedScopes}, false)`,
    })
    .from(plugins)
    .leftJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(and(eq(plugins.status, 'active'), where));

const shownPlugin = async (client: Db, name: string) =>
  oneRow(await selectPlugins(client, eq(plugins.name, name)).limit(1));

export const listPlugins = async () => ({
  data: await wholeList((limit) => selectPlugins(db()).orderBy(plugins.name).limit(limit)),
});

const pluginOrThrow = async (client: Db, name: string) => {
  const [row] = await client
    .select()
    .from(plugins)
    .where(and(eq(plugins.name, name), eq(plugins.status, 'active')))
    .limit(1);

  if (!row) throw fail('PLUGIN_NOT_FOUND', 'No such plugin');

  return row;
};

/** Installs a plugin, or grants the scopes a newer version asks for. */
export const installPlugin = async (name: string) => {
  await assertPluginInPlan(requestOrgId(), name);

  const { userId } = caller('user');
  const tx = db();

  const row = await pluginOrThrow(tx, name);
  const scopes = requestedScopes(row);

  const [before] = await tx
    .select()
    .from(pluginInstallations)
    .where(eq(pluginInstallations.plugin, name))
    .limit(1);

  await tx
    .insert(pluginInstallations)
    .values({
      plugin: name,
      grantedScopes: scopes,
      installedBy: userId,
    })
    .onConflictDoUpdate({
      target: [pluginInstallations.orgId, pluginInstallations.plugin],
      set: {
        status: 'active',
        statusReason: null,
        grantedScopes: scopes,
        installedBy: userId,
        updatedAt: sql`now()`,
        installedAt: before?.status === 'active' ? before.installedAt : sql`now()`,
      },
    });

  await recordAudit(tx, {
    action: before?.status === 'active' ? 'plugin.scopes_approved' : 'plugin.installed',
    targetType: 'plugin',
    targetId: name,
    targetLabel: row.manifest?.title ?? name,
    changes: { scopes: [before?.status === 'active' ? before.grantedScopes : [], scopes] },
  });

  return shownPlugin(tx, name);
};

/** Uninstalls: tokens stop working on the next request. Data stays in the plugin. */
export const uninstallPlugin = async (name: string) => {
  const tx = db();

  const row = await pluginOrThrow(tx, name);

  const [installation] = await tx
    .update(pluginInstallations)
    .set({ status: 'disabled', updatedAt: sql`now()` })
    .where(eq(pluginInstallations.plugin, name))
    .returning();

  if (!installation) throw fail('NOT_INSTALLED', `${name} is not installed`);

  await recordAudit(tx, {
    action: 'plugin.uninstalled',
    targetType: 'plugin',
    targetId: name,
    targetLabel: row.manifest?.title ?? name,
  });

  return shownPlugin(tx, name);
};

/**
 * A member's 5-minute token for one plugin's API: the plugin verifies it with
 * core's public keys (JWKS), never sees core's session cookie, and can't use
 * it anywhere else (`aud` is the plugin).
 */
export const pluginSession = async (name: string) => {
  const me = caller('user');
  const orgId = requestOrgId();

  const [row] = await db()
    .select({ plugin: plugins, installation: pluginInstallations })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(
      and(
        eq(plugins.name, name),
        eq(plugins.status, 'active'),
        eq(pluginInstallations.status, 'active'),
      ),
    )
    .limit(1);

  if (!row) throw fail('NOT_INSTALLED', `${name} is not installed in this organisation`);

  // SaaS: the plugin's tier here (gate Plus/Pro features) and whether it may change anything.
  const plan = await entitlementsOf(orgId);
  const access = accessOf(plan, name);

  if (access === 'off') throw fail('NOT_IN_PLAN', `${name} is not in your plan`);

  // The member's permissions within this plugin (`hr.leave.approve`, …), for its API to check.
  const permissions = (row.plugin.manifest?.permissions ?? [])
    .map((permission) => permission.action)
    .filter((action) => can(me, action));

  const token = await signJwt(
    { org: orgId, role: me.role, permissions, tier: tierOf(plan, name), access },
    {
      typ: PLUGIN_SESSION_TYP,
      audience: name,
      subject: me.userId,
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
export const pluginSignal = async (input: { topics: string[]; userIds?: string[] }) => {
  if (input.topics.length)
    await db().execute(
      sql`select core_live_signal(${requestOrgId()}, ${caller('plugin').plugin}, topic, ${input.userIds?.length ? textArray(input.userIds) : sql`null::text[]`}) from unnest(${textArray(input.topics)}) as topic`,
    );

  return { ok: true as const };
};
