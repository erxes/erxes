import { PluginSignInIdentity, type PluginSignInRequest } from '@erxes/core-contract';
import { newId, pluginInstallations, plugins, withOrg } from '@erxes/core-db';
import { and, arrayContains, eq } from 'drizzle-orm';
import { fail } from '~/http/errors';
import { sha256 } from '~/lib/crypto';
import { postOutbound } from '~/lib/outbound';
import { signJwt } from '~/lib/signing';
import { logger } from '~/logger';
import { licenseAccess, stricter } from '~/modules/license/license';
import { installedWhere } from '~/modules/plugins/pluginDelivery';
import { accessOf } from '~/modules/saas/access';
import { entitlementsOf } from '~/modules/saas/entitlements';

const log = logger.child({ component: 'sign-in providers' });

/** The token's `typ` on core's call to a provider's `<api.url>/auth/sign-in`. */
const SIGN_IN_TYP = 'erxes-core-sign-in+jwt';

/** The most a provider's answer may carry. */
const MAX_BYTES = 16 * 1024;

/**
 * The organisation's sign-in providers: its running plugins with `manifest.signIn` that the owner
 * granted `users:sign_in`, unless the plan or the erxes license has turned them off.
 */
export const providersOf = async (orgId: string) => {
  const rows = await withOrg(orgId, (tx) =>
    tx
      .select({ plugin: plugins.name, manifest: plugins.manifest })
      .from(pluginInstallations)
      .innerJoin(plugins, eq(plugins.name, pluginInstallations.plugin))
      .where(
        and(installedWhere(), arrayContains(pluginInstallations.grantedScopes, ['users:sign_in'])),
      ),
  );

  const plan = await entitlementsOf(orgId);

  const providers = await Promise.all(
    rows.map(async ({ plugin, manifest }) => {
      if (!manifest?.signIn || !manifest.api) return [];

      const access = stricter(accessOf(plan, plugin), await licenseAccess(plugin, manifest));

      return access === 'off'
        ? []
        : [{ plugin, label: manifest.signIn.label, url: manifest.api.url }];
    }),
  );

  return providers.flat();
};

type Provider = Awaited<ReturnType<typeof providersOf>>[number];

/** Who the member is when the provider answers 200, null on 401; any other answer is a fault. */
const identityOf = (status: number, body: string) => {
  if (status === 401) return null;

  if (status !== 200) throw new Error(`the provider answered ${status}`);

  return PluginSignInIdentity.parse(JSON.parse(body));
};

/**
 * Asks the provider whether the login and password are right, with a one-minute core token that
 * names the organisation and signs the body. Resolves with who the member is, or null when they
 * are wrong. Call it outside any transaction: it waits on the plugin.
 */
export const askProvider = async (
  orgId: string,
  provider: Provider,
  attempt: PluginSignInRequest,
) => {
  const body = JSON.stringify(attempt);
  const id = newId();

  const token = await signJwt(
    { org: orgId, signIn: id, sha: sha256(body, 'base64url') },
    { typ: SIGN_IN_TYP, audience: provider.plugin, subject: `sign-in:${id}`, expiresInSeconds: 60 },
  );

  try {
    const answer = await postOutbound(
      `${provider.url.replace(/\/+$/, '')}/auth/sign-in`,
      body,
      { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      { timeoutMs: 15_000, maxBytes: MAX_BYTES },
    );

    return identityOf(answer.status, answer.body);
  } catch (error) {
    log.warn(
      { err: error, plugin: provider.plugin },
      'a sign-in provider did not answer as it should',
    );

    throw fail('PLUGIN_UNREACHABLE', `${provider.label} did not answer: try again`);
  }
};
