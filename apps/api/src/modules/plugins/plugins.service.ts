import { CORE_PERMISSION_AREAS, type PluginManifest } from '@erxes/core-contract';
import {
  caller,
  type Db,
  db,
  organizations,
  pluginInstallations,
  plugins,
  type StoredPluginManifest,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { textArray } from '@erxes/plugin-sdk/filter';
import { and, eq, sql } from 'drizzle-orm';
import { config } from '~/config';
import { PLUGIN_ACCESS_TYP } from '~/http/auth';
import { fail } from '~/http/errors';
import { randomToken, safeEqual, sha256 } from '~/lib/crypto';
import { oneRow } from '~/lib/rows';
import { inOrder } from '~/lib/sequence';
import { signJwt } from '~/lib/signing';
import { syncPluginDataFields } from '~/modules/dataExtensions/pluginFieldSync';
import { licenseWarnings } from '~/modules/license/license';
import { grantDefaultPermissions } from '~/modules/roles/defaultGrants';
import { checkManifest } from './manifestChecks';
import { manifestWarnings } from './manifestWarnings';
import { queueInstallJobs, schedulePluginJobs } from './pluginJobs';
import { requestedScopes } from './requestedScopes';

type PluginRow = typeof plugins.$inferSelect;

/** Plugin server tokens (client credentials). */
const PLUGIN_TOKEN_TTL_SECONDS = 15 * 60;

/** After rotation, the previous secret keeps working this long. */
const SECRET_OVERLAP_HOURS = 24;

/**
 * With auto-install the deployment decides the plugins, and on SaaS the plan does, so a newer
 * version's scopes are granted where it is installed, as an owner approving them on
 * Settings › Plugins would; its `onInstall` jobs run for what it could not do before.
 */
const approveNewScopes = async (tx: Db, plugin: string, manifest: PluginManifest) => {
  if (!config.plugins.autoInstall && !config.saas.enabled) return;

  const scopes = requestedScopes({ manifest });

  const approved = await tx
    .update(pluginInstallations)
    .set({ grantedScopes: scopes, updatedAt: sql`now()` })
    .where(
      and(
        eq(pluginInstallations.plugin, plugin),
        eq(pluginInstallations.status, 'active'),
        sql`not ${textArray(scopes)} <@ ${pluginInstallations.grantedScopes}`,
      ),
    )
    .returning({ orgId: pluginInstallations.orgId, updatedAt: pluginInstallations.updatedAt });

  await inOrder(approved, (row) =>
    queueInstallJobs(tx, row.orgId, plugin, manifest.jobs, row.updatedAt),
  );
};

/** Installs every plugin row in every organisation, in one insert. */
const installAll = async (
  tx: Db,
  orgIds: string[],
  rows: Pick<PluginRow, 'name' | 'manifest'>[],
) => {
  const values = orgIds.flatMap((orgId) =>
    rows.map((row) => ({ orgId, plugin: row.name, grantedScopes: requestedScopes(row) })),
  );

  if (values.length) await tx.insert(pluginInstallations).values(values).onConflictDoNothing();
};

/**
 * Makes `hash` the plugin's secret. A new plugin is registered (and, with
 * auto-install, installed in every organisation once: a system scope); a
 * changed secret keeps the old one working for 24 hours.
 */
const storeSecret = (name: string, hash: string) =>
  withSystem('plugin registry', async (tx) => {
    const [existing] = await tx
      .select()
      .from(plugins)
      .where(eq(plugins.name, name))
      .for('update')
      .limit(1);

    if (!existing) {
      const row = oneRow(
        await tx
          .insert(plugins)
          .values({ name, secretHash: hash, secretRotatedAt: sql`now()` })
          .returning(),
      );

      if (config.plugins.autoInstall) {
        const orgs = await tx.select({ id: organizations.id }).from(organizations);

        await installAll(
          tx,
          orgs.map((org) => org.id),
          [row],
        );
      }

      return;
    }

    if (existing.secretHash === hash) return;

    await tx
      .update(plugins)
      .set({
        secretHash: hash,
        previousSecretHash: existing.secretHash,
        previousSecretExpiresAt: sql`now() + make_interval(hours => ${SECRET_OVERLAP_HOURS})`,
        secretRotatedAt: sql`now()`,
        updatedAt: sql`now()`,
      })
      .where(eq(plugins.name, name));
  });

/** A plugin named after a core area would declare core's permissions as its own. */
const reservedName = (name: string) => CORE_PERMISSION_AREAS.has(name);

/** Brings the registry in line with `CORE_PLUGIN_KEYS` (`name:secret`) at startup. */
export const syncPluginSecrets = async () => {
  const reserved = [...config.pluginKeys.values()].filter(reservedName);

  if (reserved.length) {
    throw new Error(
      `CORE_PLUGIN_KEYS: ${reserved.join(', ')} ${reserved.length > 1 ? 'are' : 'is'} reserved for core's own permissions; rename the plugin`,
    );
  }

  // In order: one name may come with two secrets (a rotation), and the later one wins.
  return inOrder(config.pluginKeys, ([secret, name]) => storeSecret(name, sha256(secret)));
};

/** A new random client secret for a plugin; the previous one works 24 more hours. Prints nowhere: the caller shows it once. */
export const rotatePluginSecret = async (name: string) => {
  const secret = `erxp_${randomToken(32)}`;

  await storeSecret(name, sha256(secret));

  return secret;
};

/** New organisations get every active plugin when auto-install is on (self-hosted, development). */
export const installPluginsForNewOrganization = async (tx: Db, orgId: string) => {
  // On SaaS the plan decides (`reconcilePlugins`), not the deployment.
  if (!config.plugins.autoInstall || config.saas.enabled) return;

  const rows = await tx.select().from(plugins).where(eq(plugins.status, 'active'));

  await installAll(tx, [orgId], rows);
  await withOrg(orgId, (scoped) =>
    inOrder(rows, async (row) => {
      await syncPluginDataFields(scoped, row.name, row.manifest?.fields);
      await grantDefaultPermissions(scoped, row.name, row.manifest?.permissionSets);
    }),
  );
};

const invalidClient = () => fail('INVALID_CLIENT', 'Unknown plugin or wrong client secret');

/** The scopes the organisation granted that the plugin still asks for (it must be installed there). */
const grantedScopes = async (row: PluginRow, org: string) => {
  const installation = await withOrg(org, async (tx) => {
    const [found] = await tx
      .update(pluginInstallations)
      .set({ lastTokenAt: sql`now()` })
      .where(eq(pluginInstallations.plugin, row.name))
      .returning();

    return found;
  });

  if (installation?.status !== 'active') {
    throw fail('NOT_INSTALLED', `${row.name} is not installed in this organisation`);
  }

  const requested = new Set(requestedScopes(row));

  return installation.grantedScopes.filter((scope) => requested.has(scope));
};

/**
 * Client credentials → a short-lived ES256 token. With `org`, only for an
 * organisation that installed the plugin, carrying the scopes it granted
 * (and the plugin still asks for); without, a deployment-wide token for the
 * manifest.
 */
export const issuePluginToken = async (input: {
  client_id: string;
  client_secret: string;
  org?: string;
}) => {
  const [row] = await db().select().from(plugins).where(eq(plugins.name, input.client_id)).limit(1);
  const hash = sha256(input.client_secret);

  if (!row || row.status !== 'active') throw invalidClient();

  const current = row.secretHash !== null && safeEqual(row.secretHash, hash);

  const previous =
    !current &&
    row.previousSecretHash !== null &&
    safeEqual(row.previousSecretHash, hash) &&
    row.previousSecretExpiresAt !== null &&
    row.previousSecretExpiresAt.getTime() > Date.now();

  if (!current && !previous) throw invalidClient();

  const scope = input.org ? (await grantedScopes(row, input.org)).join(' ') : '';

  await db()
    .update(plugins)
    .set({ lastSeenAt: sql`now()` })
    .where(eq(plugins.name, row.name));

  const access_token = await signJwt(
    input.org ? { org: input.org, scope } : { scope: 'manifest' },
    {
      typ: PLUGIN_ACCESS_TYP,
      audience: 'erxes-core',
      subject: row.name,
      expiresInSeconds: PLUGIN_TOKEN_TTL_SECONDS,
    },
  );

  return {
    access_token,
    token_type: 'Bearer' as const,
    expires_in: PLUGIN_TOKEN_TTL_SECONDS,
    scope: input.org ? scope : 'manifest',
  };
};

/** The plugin's own manifest (deployment-wide token). */
export const registerManifest = async (manifest: PluginManifest) => {
  const { plugin } = caller('plugin');

  // A row registered before the name was reserved still can't claim core's permissions.
  if (reservedName(plugin)) {
    throw fail('NAMESPACE_REQUIRED', `"${plugin}" is a core area: rename the plugin`);
  }

  checkManifest(plugin, manifest);

  await withSystem('plugin manifest', async (tx) => {
    const [before] = await tx
      .select({ manifest: plugins.manifest })
      .from(plugins)
      .where(eq(plugins.name, plugin))
      .for('update');

    await tx
      .update(plugins)
      .set({ manifest: manifest satisfies StoredPluginManifest, updatedAt: sql`now()` })
      .where(eq(plugins.name, plugin));
    await schedulePluginJobs(tx, plugin, manifest.jobs);
    await approveNewScopes(tx, plugin, manifest);
    // Every organisation that has it gets the manifest's fields, and what its sets newly give.
    await syncPluginDataFields(tx, plugin, manifest.fields);
    await grantDefaultPermissions(
      tx,
      plugin,
      manifest.permissionSets,
      before?.manifest?.permissionSets,
    );
  });

  return {
    ok: true as const,
    warnings: [...manifestWarnings(manifest), ...(await licenseWarnings(plugin, manifest))],
  };
};
