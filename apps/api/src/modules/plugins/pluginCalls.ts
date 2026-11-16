import { pluginReadScope } from '@erxes/core-contract';
import { caller, db, pluginInstallations, plugins, requestOrgId } from '@erxes/core-db';
import { and, eq, inArray } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { signJwt } from '~/lib/signing';
import { accessOf, tierOf } from '~/modules/saas/access';
import { entitlementsOf } from '~/modules/saas/entitlements';

/** JOSE `typ` of a token for one plugin reading another plugin's API (`verifyPluginCall`). */
const PLUGIN_CALL_TYP = 'erxes-plugin-call+jwt';

const PLUGIN_CALL_TTL_SECONDS = 5 * 60;

/** The calling plugin and the one it reads, where both are active and installed here. */
const installedPair = (from: string, to: string) =>
  db()
    .select({
      name: plugins.name,
      manifest: plugins.manifest,
      grantedScopes: pluginInstallations.grantedScopes,
    })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(
      and(
        inArray(plugins.name, [from, to]),
        eq(plugins.status, 'active'),
        eq(pluginInstallations.status, 'active'),
      ),
    );

type Installed = Awaited<ReturnType<typeof installedPair>>[number];

/**
 * The permissions `source` may read `target` with: those its manifest's `pluginReads` asks for,
 * the owner approved, and the target's manifest still declares.
 */
const approvedReads = (source: Installed | undefined, target: Installed) => {
  const asked = new Set(
    source?.manifest?.pluginReads
      ?.filter((read) => read.plugin === target.name)
      .flatMap((read) => read.permissions),
  );

  const granted = new Set(source?.grantedScopes);

  return (target.manifest?.permissions ?? [])
    .map((permission) => permission.action)
    .filter((action) => asked.has(action) && granted.has(pluginReadScope(action)));
};

/**
 * A 5-minute token for plugin `name`'s API, for the calling plugin in this organisation: `aud` is
 * that plugin, `sub` `plugin:<caller>`, with the approved permissions, the organisation and the
 * target's plan, so the target's own member checks apply unchanged.
 */
export const pluginCallToken = async (name: string) => {
  const { plugin: from } = caller('plugin');
  const orgId = requestOrgId();

  const rows = await installedPair(from, name);
  const target = rows.find((row) => row.name === name);

  if (!target) throw fail('PLUGIN_NOT_INSTALLED', `${name} is not installed in this organisation`);

  const permissions = approvedReads(
    rows.find((row) => row.name === from),
    target,
  );

  if (name === from || !permissions.length) {
    throw fail('READ_NOT_APPROVED', `Reading ${name} is not approved in this organisation`);
  }

  const apiUrl = target.manifest?.api?.url;

  if (!apiUrl) throw fail('PLUGIN_UNREACHABLE', `${name} has no API address`);

  const plan = await entitlementsOf(orgId);
  const access = accessOf(plan, name);

  if (access === 'off') throw fail('NOT_IN_PLAN', `${name} is not in this organisation's plan`);

  const token = await signJwt(
    { org: orgId, plugin: from, permissions, tier: tierOf(plan, name), access },
    {
      typ: PLUGIN_CALL_TYP,
      audience: name,
      subject: `plugin:${from}`,
      expiresInSeconds: PLUGIN_CALL_TTL_SECONDS,
    },
  );

  return {
    token,
    expiresAt: new Date(Date.now() + PLUGIN_CALL_TTL_SECONDS * 1000).toISOString(),
    apiUrl,
    permissions,
  };
};
