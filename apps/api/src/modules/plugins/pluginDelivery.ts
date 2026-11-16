import { type Db, pluginInstallations, plugins } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { sha256 } from '~/lib/crypto';
import { postOutbound } from '~/lib/outbound';
import { signJwt } from '~/lib/signing';

/** Installations of the plugin, joined to it, where both are active. */
export const installedWhere = (plugin: string) =>
  and(
    eq(pluginInstallations.plugin, plugin),
    eq(pluginInstallations.status, 'active'),
    eq(plugins.status, 'active'),
  );

/** The plugin's installation in the scope's organisation, when both are active. */
export const activeInstallation = async (tx: Db, plugin: string) => {
  const [row] = await tx
    .select({ scopes: pluginInstallations.grantedScopes, manifest: plugins.manifest })
    .from(pluginInstallations)
    .innerJoin(plugins, eq(plugins.name, pluginInstallations.plugin))
    .where(installedWhere(plugin))
    .limit(1);

  return row;
};

interface Delivery {
  plugin: string;
  /** The plugin's `api.url`. */
  url: string;
  /** Under `api.url`: `/events`, `/jobs/mail.sync`. */
  path: string;
  orgId: string;
  /** The token's subject is `<kind>:<id>` and its claims carry `<kind>: <id>`; the id is the `Idempotency-Key`. */
  kind: 'event' | 'job' | 'access';
  id: string;
  body: string;
  typ: string;
  headers: Record<string, string>;
  timeoutMs?: number;
}

/**
 * POSTs `body` to the plugin's API with a 5-minute core token: `aud` the
 * plugin, `sha` the body's digest, so the body can't be swapped under the
 * token. Anything but 2xx throws, so the job retries. Resolves with the answer's body.
 */
export const deliverToPlugin = async (delivery: Delivery) => {
  const token = await signJwt(
    { org: delivery.orgId, [delivery.kind]: delivery.id, sha: sha256(delivery.body, 'base64url') },
    {
      typ: delivery.typ,
      audience: delivery.plugin,
      subject: `${delivery.kind}:${delivery.id}`,
      expiresInSeconds: 300,
    },
  );

  const response = await postOutbound(
    `${delivery.url.replace(/\/+$/, '')}${delivery.path}`,
    delivery.body,
    {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': delivery.id,
      ...delivery.headers,
    },
    delivery.timeoutMs,
  );

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `${delivery.plugin} answered ${response.status}: ${response.body.slice(0, 300)}`,
    );
  }

  return response.body;
};
