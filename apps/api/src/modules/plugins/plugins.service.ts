import { PLUGIN_SCOPES, type PluginManifest } from '@erxes/core-contract';
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
import { eq, sql } from 'drizzle-orm';
import { config } from '~/config';
import { PLUGIN_ACCESS_TYP } from '~/http/auth';
import { fail } from '~/http/errors';
import { randomToken, safeEqual, sha256 } from '~/lib/crypto';
import { oneRow } from '~/lib/rows';
import { inOrder } from '~/lib/sequence';
import { signJwt } from '~/lib/signing';

type PluginRow = typeof plugins.$inferSelect;

/** Plugin server tokens (client credentials). */
const PLUGIN_TOKEN_TTL_SECONDS = 15 * 60;

/** After rotation, the previous secret keeps working this long. */
const SECRET_OVERLAP_HOURS = 24;

/** Scopes a plugin asks for: its manifest's, or (before it sent one) what plugins could always do. */
export const requestedScopes = (row: Pick<PluginRow, 'manifest'>): string[] =>
  row.manifest?.scopes ?? [...PLUGIN_SCOPES];

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

/** Brings the registry in line with `CORE_PLUGIN_KEYS` (`name:secret`) at startup. */
export const syncPluginSecrets = () =>
  // In order: one name may come with two secrets (a rotation), and the later one wins.
  inOrder(config.pluginKeys, ([secret, name]) => storeSecret(name, sha256(secret)));

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

const namespaced = (plugin: string, values: string[] | undefined, what: string) => {
  const wrong = (values ?? []).find((value) => !value.startsWith(`${plugin}.`));

  if (wrong) {
    throw fail('NAMESPACE_REQUIRED', `${what} must start with "${plugin}.": ${wrong}`);
  }
};

/** Permission sets name only the manifest's own permissions, and each key once. */
const ownPermissionSets = (manifest: PluginManifest) => {
  const declared = new Set(manifest.permissions?.map((item) => item.action));
  const keys = new Set<string>();

  for (const set of manifest.permissionSets ?? []) {
    const unknown = set.permissions.find((action) => !declared.has(action));

    if (unknown) {
      throw fail(
        'UNKNOWN_PERMISSION',
        `Permission set "${set.key}" names ${unknown}, which the manifest's permissions don't declare`,
        { permissions: [unknown] },
      );
    }

    if (keys.has(set.key)) {
      throw fail('DUPLICATE_PERMISSION_SET', `Two permission sets are "${set.key}"`);
    }

    keys.add(set.key);
  }
};

/** The plugin's own manifest (deployment-wide token). */
export const registerManifest = async (manifest: PluginManifest) => {
  const { plugin } = caller('plugin');

  namespaced(
    plugin,
    manifest.permissions?.map((item) => item.action),
    'Permission actions',
  );
  ownPermissionSets(manifest);
  namespaced(
    plugin,
    manifest.notificationKinds?.map((item) => item.kind),
    'Notification kinds',
  );
  namespaced(
    plugin,
    manifest.events?.map((item) => item.type),
    'Event types',
  );

  if (manifest.assistant?.operations.length && !manifest.api) {
    throw new HttpError(400, 'API_REQUIRED', 'Assistant operations are called at api.url: add api');
  }

  await db()
    .update(plugins)
    .set({ manifest: manifest satisfies StoredPluginManifest, updatedAt: sql`now()` })
    .where(eq(plugins.name, plugin));

  return { ok: true as const };
};
