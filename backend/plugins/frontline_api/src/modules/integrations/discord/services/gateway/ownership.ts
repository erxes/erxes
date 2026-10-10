import {
  getEnv,
  getSaasOrganizations,
  getSaasCoreConnection,
} from 'erxes-api-shared/utils';

import { generateModels } from '~/connectionResolvers';

import { redlock, TDiscordLock } from '@/integrations/discord/redlock';

import { debugDiscord, debugError } from '@/integrations/discord/debuggers';

import {
  sweepDiscordOrphanIntegrations,
  revalidateStaleDiscordTokens,
  computeDesiredDiscordTokens,
  closeUndesiredDiscordSockets,
} from '@/integrations/discord/services/gateway/maintenance';

import {
  connectDiscordToken,
  disconnectDiscordToken,
} from '@/integrations/discord/services/gateway/connection';

import {
  ownedTokens,
  ownedSubdomains,
  ownerLoops,
} from '@/integrations/discord/state/gateway';

import {
  LOCK_TTL,
  ACQUIRE_RETRY_INTERVAL,
  LOCK_RENEW_INTERVAL,
  RECONCILE_INTERVAL,
  ORG_DISCOVERY_INTERVAL,
} from '@/integrations/discord/constants/gateway';

const { NODE_ENV } = process.env;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sleepUnlessLost = async (ms: number, isLost: () => boolean) => {
  let waited = 0;
  while (waited < ms && !isLost()) {
    const step = Math.min(2000, ms - waited);
    await sleep(step); // NOSONAR: Poll lock loss between dependent delay steps.
    waited += step;
  }
};

const reconcileSubdomain = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  await sweepDiscordOrphanIntegrations(models, subdomain);

  await revalidateStaleDiscordTokens(models);

  const desired = await computeDesiredDiscordTokens(models);

  await Promise.all(
    Array.from(desired, (token) => connectDiscordToken(subdomain, token)),
  );

  await closeUndesiredDiscordSockets(subdomain, desired);
};

const teardownSubdomain = async (subdomain: string) => {
  const owned = ownedTokens.get(subdomain);
  if (!owned) {
    return;
  }
  await Promise.all(
    Array.from(owned, (token) => disconnectDiscordToken(subdomain, token)),
  );
  ownedTokens.delete(subdomain);
};

const runOwnerLoop = async (subdomain: string) => {
  const key = `${subdomain}:discord:work_distributor`;

  while (true) {
    let lock: TDiscordLock;
    try {
      lock = await redlock.acquire([key], LOCK_TTL); // NOSONAR: Acquire ownership before running this cycle.
    } catch {
      await sleep(ACQUIRE_RETRY_INTERVAL); // NOSONAR: Failed acquisition must back off before retrying.
      continue;
    }

    ownedSubdomains.add(subdomain);
    let lost = false;

    const renew = setInterval(async () => {
      try {
        lock = await lock.extend(LOCK_TTL);
      } catch {
        lost = true;
      }
    }, LOCK_RENEW_INTERVAL);

    try {
      // skipcq: JS-0092 — `lost` is flipped by the lock-renew setInterval above.
      while (!lost) {
        try {
          await reconcileSubdomain(subdomain); // NOSONAR: Reconciliation cycles must not overlap.
        } catch (error) {
          debugError(
            `Discord reconcile error for ${subdomain}: ${
              (error as Error).message
            }`,
          );
        }
        await sleepUnlessLost(RECONCILE_INTERVAL, () => lost); // NOSONAR: Wait or detect lock loss before the next cycle.
      }
    } finally {
      clearInterval(renew);
      ownedSubdomains.delete(subdomain);
      await teardownSubdomain(subdomain); // NOSONAR: Close owned sockets before releasing or reacquiring the lock.
      try {
        await lock.release(); // NOSONAR: Release the previous lock before reacquiring ownership.
      } catch {
        // The lock may already have expired or been transferred during teardown.
      }
    }
  }
};

const ensureOwnerLoop = (subdomain: string) => {
  if (!subdomain || ownerLoops.has(subdomain)) {
    return;
  }
  ownerLoops.add(subdomain);
  runOwnerLoop(subdomain).catch((error) => {
    ownerLoops.delete(subdomain);
    debugError(
      `Discord owner loop crashed for ${subdomain}: ${
        (error as Error).message
      }`,
    );
  });
};

const startDistributing = async (subdomain: string) => {
  if (NODE_ENV === 'production') {
    await sleep(60000);
  }
  ensureOwnerLoop(subdomain);
};

const startSaasDistributing = async () => {
  await getSaasCoreConnection();

  if (NODE_ENV === 'production') {
    await sleep(60000);
  }

  while (true) {
    try {
      const organizations = await getSaasOrganizations(); // NOSONAR: Discover organizations once per polling cycle.
      for (const org of organizations) {
        ensureOwnerLoop(org.subdomain);
      }
    } catch (error) {
      debugError(`Discord SaaS discovery error: ${(error as Error).message}`);
    }
    await sleep(ORG_DISCOVERY_INTERVAL); // NOSONAR: Bound discovery frequency before polling again.
  }
};

export const initDiscord = () => {
  const VERSION = getEnv({ name: 'VERSION' });

  debugDiscord('Initializing Discord gateway distributor');

  const distributor =
    VERSION === 'saas' ? startSaasDistributing() : startDistributing('os');

  distributor.catch((err) =>
    debugError(`Failed to start Discord distributor: ${err.message}`),
  );
};
