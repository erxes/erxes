import { PLUGIN_SCOPES, type Plugin, type PluginManifest } from '@erxes/core-contract';
import {
  type Db,
  db,
  organizations,
  pluginInstallations,
  plugins,
  type StoredPluginManifest,
} from '@erxes/core-db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { config } from '~/config';
import {
  type Actor,
  PLUGIN_ACCESS_TYP,
  type PluginCaller,
  type PluginService,
  userCaller,
} from '~/http/auth';
import { HttpError } from '~/http/errors';
import { signJwt } from '~/lib/signing';
import { recordAudit } from '~/modules/audit/audit.service';

type PluginRow = typeof plugins.$inferSelect;
type InstallationRow = typeof pluginInstallations.$inferSelect;

/** Plugin server tokens (client credentials). */
export const PLUGIN_TOKEN_TTL_SECONDS = 15 * 60;
/** Plugin UI tokens: a member's session for one plugin's API. */
export const PLUGIN_SESSION_TTL_SECONDS = 5 * 60;
export const PLUGIN_SESSION_TYP = 'erxes-plugin-session+jwt';
/** After rotation, the previous secret keeps working this long. */
export const SECRET_OVERLAP_HOURS = 24;

const hashSecret = (secret: string) => createHash('sha256').update(secret).digest('hex');

const sameHash = (a: string | null, b: string) =>
  a !== null && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/** Scopes a plugin asks for: its manifest's, or (before it sent one) what plugins could always do. */
const requestedScopes = (row: Pick<PluginRow, 'manifest'>): string[] =>
  row.manifest?.scopes ?? [...PLUGIN_SCOPES];

const toPluginDto = (row: PluginRow, installation?: InstallationRow | null): Plugin => {
  const requested = requestedScopes(row);
  const installed = installation?.status === 'active';
  const granted = installed ? installation.grantedScopes : [];

  return {
    name: row.name,
    title: row.manifest?.title ?? row.name,
    version: row.manifest?.version ?? null,
    description: row.manifest?.description ?? null,
    ui: row.manifest?.ui ?? null,
    api: row.manifest?.api ?? null,
    installed,
    requestedScopes: requested,
    grantedScopes: granted,
    needsApproval: installed && requested.some((scope) => !granted.includes(scope)),
    installedAt: installed ? installation.installedAt.toISOString() : null,
  };
};

const installAll = async (tx: Db, orgIds: string[], row: Pick<PluginRow, 'name' | 'manifest'>) => {
  if (!orgIds.length) return;

  await tx
    .insert(pluginInstallations)
    .values(
      orgIds.map((orgId) => ({ orgId, plugin: row.name, grantedScopes: requestedScopes(row) })),
    )
    .onConflictDoNothing();
};

/**
 * Brings the registry in line with `CORE_PLUGIN_KEYS` (`name:secret`) at
 * startup: new plugins are registered (and, with auto-install, installed in
 * every organisation once); a changed secret becomes the current one and the
 * old one keeps working for 24 hours.
 */
export const syncPluginSecrets = async (client: Db = db()) => {
  for (const [secret, name] of config.pluginKeys) {
    const hash = hashSecret(secret);

    await client.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(plugins)
        .where(eq(plugins.name, name))
        .for('update')
        .limit(1);

      if (!existing) {
        const [row] = await tx
          .insert(plugins)
          .values({ name, secretHash: hash, secretRotatedAt: sql`now()` })
          .returning();

        if (config.plugins.autoInstall) {
          const orgs = await tx.select({ id: organizations.id }).from(organizations);

          await installAll(
            tx,
            orgs.map((org) => org.id),
            row!,
          );
        }

        return;
      }

      if (existing.secretHash !== hash) {
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
      }
    });
  }
};

/** A new random client secret for a plugin; the previous one works 24 more hours. Prints nowhere: the caller shows it once. */
export const rotatePluginSecret = async (name: string, client: Db = db()) => {
  const secret = `erxp_${randomBytes(32).toString('base64url')}`;
  const hash = hashSecret(secret);

  await client.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(plugins)
      .where(eq(plugins.name, name))
      .for('update')
      .limit(1);

    if (!existing) {
      const [row] = await tx
        .insert(plugins)
        .values({ name, secretHash: hash, secretRotatedAt: sql`now()` })
        .returning();

      if (config.plugins.autoInstall) {
        const orgs = await tx.select({ id: organizations.id }).from(organizations);

        await installAll(
          tx,
          orgs.map((org) => org.id),
          row!,
        );
      }

      return;
    }

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

  return secret;
};

/** New organisations get every active plugin when auto-install is on (self-hosted, development). */
export const installPluginsForNewOrganization = async (tx: Db, orgId: string) => {
  if (!config.plugins.autoInstall) return;

  const rows = await tx.select().from(plugins).where(eq(plugins.status, 'active'));

  for (const row of rows) {
    await installAll(tx, [orgId], row);
  }
};

const invalidClient = () =>
  new HttpError(401, 'INVALID_CLIENT', 'Unknown plugin or wrong client secret');

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
  const hash = hashSecret(input.client_secret);

  if (!row || row.status !== 'active') throw invalidClient();

  const current = sameHash(row.secretHash, hash);
  const previous =
    !current &&
    sameHash(row.previousSecretHash, hash) &&
    row.previousSecretExpiresAt !== null &&
    row.previousSecretExpiresAt.getTime() > Date.now();

  if (!current && !previous) throw invalidClient();

  let scopes: string[] = [];

  if (input.org) {
    const [installation] = await db()
      .select()
      .from(pluginInstallations)
      .where(
        and(eq(pluginInstallations.orgId, input.org), eq(pluginInstallations.plugin, row.name)),
      )
      .limit(1);

    if (installation?.status !== 'active') {
      throw new HttpError(
        403,
        'NOT_INSTALLED',
        `${row.name} is not installed in this organisation`,
      );
    }

    const requested = new Set(requestedScopes(row));

    scopes = installation.grantedScopes.filter((scope) => requested.has(scope));

    void db()
      .update(pluginInstallations)
      .set({ lastTokenAt: sql`now()` })
      .where(
        and(eq(pluginInstallations.orgId, input.org), eq(pluginInstallations.plugin, row.name)),
      )
      .catch(() => undefined);
  }

  void db()
    .update(plugins)
    .set({ lastSeenAt: sql`now()` })
    .where(eq(plugins.name, row.name))
    .catch(() => undefined);

  const scope = scopes.join(' ');
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
    throw new HttpError(
      400,
      'NAMESPACE_REQUIRED',
      `${what} must start with "${plugin}.": ${wrong}`,
    );
  }
};

/** The plugin's own manifest (deployment-wide token). */
export const registerManifest = async (service: PluginService, manifest: PluginManifest) => {
  namespaced(
    service.plugin,
    manifest.permissions?.map((item) => item.action),
    'Permission actions',
  );
  namespaced(
    service.plugin,
    manifest.notificationKinds?.map((item) => item.kind),
    'Notification kinds',
  );
  namespaced(
    service.plugin,
    manifest.events?.map((item) => item.type),
    'Event types',
  );

  await db()
    .update(plugins)
    .set({ manifest: manifest satisfies StoredPluginManifest, updatedAt: sql`now()` })
    .where(eq(plugins.name, service.plugin));

  return { ok: true as const };
};

export const listPlugins = async (actor: Actor) => {
  const rows = await db()
    .select({ plugin: plugins, installation: pluginInstallations })
    .from(plugins)
    .leftJoin(
      pluginInstallations,
      and(eq(pluginInstallations.plugin, plugins.name), eq(pluginInstallations.orgId, actor.orgId)),
    )
    .where(eq(plugins.status, 'active'))
    .orderBy(plugins.name);

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

/** Installs a plugin, or grants the scopes a newer version asks for. */
export const installPlugin = (actor: Actor, name: string) =>
  db().transaction(async (tx) => {
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
  });

/** Uninstalls: tokens stop working on the next request. Data stays in the plugin. */
export const uninstallPlugin = (actor: Actor, name: string) =>
  db().transaction(async (tx) => {
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
  });

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

  const token = await signJwt(
    { org: actor.orgId, role: actor.role },
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
  await db().transaction(async (tx) => {
    for (const topic of input.topics) {
      await tx.execute(
        sql`select core_live_signal(${caller.orgId}, ${caller.plugin}, ${topic}, ${input.userIds?.length ? input.userIds : null}::text[])`,
      );
    }
  });

  return { ok: true as const };
};

export const isUninstalled = (installation: InstallationRow | undefined) =>
  !installation || installation.status !== 'active';
// Kept for scripts: plugins without a secret yet.
export const pluginsWithoutSecret = () =>
  db().select({ name: plugins.name }).from(plugins).where(isNull(plugins.secretHash));
