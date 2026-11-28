import { organizations, plugins, serverLicense, users, withOrg, withSystem } from '@erxes/core-db';
import { count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { config } from '~/config';
import { postOutbound } from '~/lib/outbound';
import { inOrder } from '~/lib/sequence';
import { logger } from '~/logger';
import { defineSchedule, describeError } from '~/modules/jobs/jobs';
import { forgetStoredLicense, verifyLicense } from './license';

const log = logger.child({ component: 'license' });

/** What erxes.io answers: the server's newest license that isn't revoked, or null for none. */
const IssuerAnswer = z.object({ license: z.string().min(1).nullable() });

/** What the server runs, as erxes.io records it beside its licenses. */
const usageReport = async () => {
  const { orgIds, registered } = await withSystem('erxes license usage', async (tx) => ({
    orgIds: (await tx.select({ id: organizations.id }).from(organizations)).map((org) => org.id),
    registered: (await tx.select({ name: plugins.name }).from(plugins)).map(
      (plugin) => plugin.name,
    ),
  }));

  let members = 0;

  // Members are each organisation's rows: counted in its own scope.
  await inOrder(orgIds, async (orgId) => {
    const [row] = await withOrg(orgId, (tx) =>
      tx.select({ count: count() }).from(users).where(eq(users.status, 'active')),
    );

    members += row?.count ?? 0;
  });

  return { version: config.version, members, organizations: orgIds.length, plugins: registered };
};

/** Asks erxes.io for the server's license; the answer, or why there is none to take. */
const askIssuer = async (key: string) => {
  const answer = await postOutbound(
    new URL('/api/self-hosted/license', config.license.issuer).toString(),
    JSON.stringify(await usageReport()),
    { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    { timeoutMs: 15_000, maxBytes: 16_384 },
  );

  if (answer.status === 401) {
    throw new Error(
      'erxes.io does not know this activation key: copy the key again from erxes.io › Self-hosted',
    );
  }

  if (answer.status !== 200) throw new Error(`erxes.io answered ${answer.status}`);

  const { license } = IssuerAnswer.parse(JSON.parse(answer.body));

  // A license this core can't verify (signed by a key from a newer release) never replaces one it can.
  if (license !== null && !(await verifyLicense(license))) {
    throw new Error('erxes.io sent a license this version of core cannot verify: update core');
  }

  return license;
};

/**
 * Self-hosted with `ERXES_ACTIVATION_KEY`: fetches the server's license from erxes.io and stores it,
 * with when it asked. When erxes.io can't be asked, or its answer can't be used, the stored license
 * stays and the reason is kept for Settings › License.
 */
export const fetchLicense = async (now = new Date()) => {
  const key = config.license.activationKey;

  if (!key || config.saas.enabled) return;

  let license: string | null | undefined;
  let checkError: string | null = null;

  try {
    license = await askIssuer(key);
  } catch (error) {
    checkError = describeError(error);
    log.warn({ err: error }, 'could not fetch the erxes license: the last one stays');
  }

  await withSystem('erxes license', (tx) =>
    tx
      .insert(serverLicense)
      .values({ token: license ?? null, checkedAt: now, checkError })
      .onConflictDoUpdate({
        target: serverLicense.id,
        set:
          license === undefined
            ? { checkedAt: now, checkError }
            : { token: license, checkedAt: now, checkError },
      }),
  );

  forgetStoredLicense();
};

/** Every day; core also fetches it when it starts. */
export const licenseSchedule = defineSchedule({
  queue: 'license.fetch',
  cron: '41 4 * * *',
  run: fetchLicense,
});
