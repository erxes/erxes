import {
  getEnv,
  getSaasOrganizations,
  getSaasCoreConnection,
} from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import { redlock, TDiscordLock } from '@/integrations/discord/redlock';
import {
  connectGateway,
  DiscordGatewayConnection,
} from '@/integrations/discord/gatewayClient';
import { receiveDiscordMessage } from '@/integrations/discord/controller/receiveMessage';
import {
  receiveDiscordMessageEdit,
  receiveDiscordPollVote,
} from '@/integrations/discord/controller/receiveEvents';
import { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import {
  getChannel,
  getErrorMessage,
  isThreadChannel,
} from '@/integrations/discord/utils';
import { backfillChannelHistory } from '@/integrations/discord/backfill';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';

const { NODE_ENV } = process.env;

const connectionKey = (subdomain: string, token: string) =>
  `${subdomain}:${token}`;
const connections = new Map<string, DiscordGatewayConnection>();

const ownedSubdomains = new Set<string>();

const ownedTokens = new Map<string, Set<string>>();

const ownerLoops = new Set<string>();

const trackOwnedToken = (subdomain: string, token: string) => {
  let set = ownedTokens.get(subdomain);
  if (!set) {
    set = new Set<string>();
    ownedTokens.set(subdomain, set);
  }
  set.add(token);
};

const untrackToken = (subdomain: string, token: string) => {
  ownedTokens.get(subdomain)?.delete(token);
};

const channelParentCache = new Map<string, string | null>();

const resolveParentId = async (
  token: string,
  channelId: string,
): Promise<string | null> => {
  if (channelParentCache.has(channelId)) {
    return channelParentCache.get(channelId) ?? null;
  }

  let parentId: string | null = null;
  try {
    const channel = await getChannel(token, channelId);
    parentId =
      (channel && isThreadChannel(channel) && channel.parent_id) || null;
  } catch (e) {
    debugError(
      `Failed to resolve parent for Discord channel ${channelId}: ${
        (e as Error).message
      }`,
    );
    return null;
  }

  channelParentCache.set(channelId, parentId);
  return parentId;
};

const retryPendingBackfill = async (
  models: IModels,
  subdomain: string,
  bot: IDiscordBotDocument,
) => {
  if (!bot.health?.backfillPending) {
    return;
  }

  const claimed = await models.DiscordBots.findOneAndUpdate(
    { _id: bot._id, 'health.backfillPending': true },
    { $set: { 'health.backfillPending': false } },
    { new: true },
  );

  if (!claimed) {
    return;
  }

  backfillChannelHistory({ models, subdomain, bot: claimed }).catch((e) =>
    debugError(
      `Discord pending backfill retry failed for ${bot._id}: ${getErrorMessage(
        e,
      )}`,
    ),
  );
};

export const connectDiscordToken = async (subdomain: string, token: string) => {
  if (!token || connections.has(connectionKey(subdomain, token))) {
    return;
  }

  if (!ownedSubdomains.has(subdomain)) {
    return;
  }

  const models = await generateModels(subdomain);

  const readyBot = await models.DiscordBots.findOne({
    token,
    'health.status': 'healthy',
    erxesApiId: { $nin: [null, ''] },
  });

  if (!readyBot) {
    return;
  }

  const label = readyBot.applicationId || 'discord';

  const usableBot = (bot: IDiscordBotDocument | null) =>
    bot && bot.health?.status === 'healthy' && bot.erxesApiId ? bot : null;

  const resolveBot = async (channelId?: string) => {
    if (!channelId) {
      return null;
    }

    const direct = usableBot(
      await models.DiscordBots.findOne({ token, channelId }).sort({
        createdAt: -1,
      }),
    );
    if (direct) {
      return direct;
    }

    const parentId = await resolveParentId(token, channelId);
    if (!parentId) {
      return null;
    }

    return usableBot(
      await models.DiscordBots.findOne({ token, channelId: parentId }).sort({
        createdAt: -1,
      }),
    );
  };

  try {
    const connection = await connectGateway({
      botId: label,
      token,
      onMessage: async (activity) => {
        try {
          const bot = await resolveBot(activity.channelId);
          if (!bot) return;
          await receiveDiscordMessage({ models, subdomain, bot, activity });
          await retryPendingBackfill(models, subdomain, bot);
        } catch (e) {
          debugError(`Discord message routing failed: ${(e as Error).message}`);
        }
      },
      onMessageEdit: async (activity) => {
        try {
          const bot = await resolveBot(activity.channelId);
          if (!bot) return;
          await receiveDiscordMessageEdit({ models, activity });
        } catch (e) {
          debugError(
            `Discord message-edit routing failed: ${(e as Error).message}`,
          );
        }
      },
      onPollVote: async (event) => {
        try {
          const bot = await resolveBot(event.channelId);
          if (!bot) return;
          await receiveDiscordPollVote({ models, subdomain, bot, event });
        } catch (e) {
          debugError(
            `Discord poll-vote routing failed: ${(e as Error).message}`,
          );
        }
      },
    });

    if (!ownedSubdomains.has(subdomain)) {
      try {
        await connection.destroy();
      } catch (e) {
        debugError(
          `Failed to close stale Discord gateway: ${(e as Error).message}`,
        );
      }
      return;
    }

    connections.set(connectionKey(subdomain, token), connection);
    trackOwnedToken(subdomain, token);
    debugDiscord(`Connected Discord gateway for app ${label} (${subdomain})`);
  } catch (e) {
    debugError(`Failed to connect Discord gateway: ${(e as Error).message}`);
  }
};

export const connectDiscordBot = async (
  subdomain: string,
  bot: IDiscordBotDocument,
) => {
  if (bot.health?.status !== 'healthy' || !bot.erxesApiId) {
    return;
  }
  await connectDiscordToken(subdomain, bot.token);
};

export const disconnectDiscordToken = async (
  subdomain: string,
  token: string,
) => {
  const key = connectionKey(subdomain, token);
  const connection = connections.get(key);

  if (connection) {
    try {
      await connection.destroy();
    } catch (e) {
      debugError(`Failed to close Discord gateway: ${(e as Error).message}`);
    }
    connections.delete(key);
  }

  untrackToken(subdomain, token);
};

const LOCK_TTL = 30_000;
const LOCK_RENEW_INTERVAL = 10_000;
const RECONCILE_INTERVAL = 30_000;
const ACQUIRE_RETRY_INTERVAL = 30_000;
const ORG_DISCOVERY_INTERVAL = 10 * 60 * 1000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sleepUnlessLost = async (ms: number, isLost: () => boolean) => {
  let waited = 0;
  while (waited < ms && !isLost()) {
    const step = Math.min(2000, ms - waited);
    await sleep(step);
    waited += step;
  }
};

const sweepDiscordOrphanIntegrations = async (
  models: IModels,
  subdomain: string,
) => {
  try {
    const reaped = await models.DiscordBots.sweepOrphanIntegrations();
    if (reaped) {
      debugDiscord(
        `Swept ${reaped} orphan Discord integration(s) for ${subdomain}`,
      );
    }
  } catch (e) {
    debugError(
      `Discord orphan sweep failed for ${subdomain}: ${(e as Error).message}`,
    );
  }
};

const computeDesiredDiscordTokens = async (models: IModels) => {
  const bots = await models.DiscordBots.find({ 'health.status': 'healthy' });
  const desired = new Set<string>();

  for (const rawBot of bots) {
    let bot: IDiscordBotDocument = rawBot;
    if (!bot.erxesApiId) {
      try {
        bot = await models.DiscordBots.ensureInboxIntegration(
          bot._id,
          bot.createdBy,
        );
      } catch (e) {
        debugError(
          `Failed to ensure inbox integration for bot ${bot._id}: ${
            (e as Error).message
          }`,
        );
        continue;
      }
    }
    if (bot.token) {
      desired.add(bot.token);
    }
  }

  return desired;
};

const closeUndesiredDiscordSockets = async (
  subdomain: string,
  desired: Set<string>,
) => {
  const owned = ownedTokens.get(subdomain);
  if (!owned) {
    return;
  }

  for (const token of [...owned]) {
    if (!desired.has(token)) {
      await disconnectDiscordToken(subdomain, token);
    }
  }
};

const reconcileSubdomain = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  await sweepDiscordOrphanIntegrations(models, subdomain);

  const desired = await computeDesiredDiscordTokens(models);

  for (const token of desired) {
    await connectDiscordToken(subdomain, token);
  }

  await closeUndesiredDiscordSockets(subdomain, desired);
};

const teardownSubdomain = async (subdomain: string) => {
  const owned = ownedTokens.get(subdomain);
  if (!owned) {
    return;
  }
  for (const token of owned) {
    await disconnectDiscordToken(subdomain, token);
  }
  ownedTokens.delete(subdomain);
};

const runOwnerLoop = async (subdomain: string) => {
  const key = `${subdomain}:discord:work_distributor`;

  while (true) {
    let lock: TDiscordLock;
    try {
      lock = await redlock.acquire([key], LOCK_TTL);
    } catch {
      await sleep(ACQUIRE_RETRY_INTERVAL);
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
          await reconcileSubdomain(subdomain);
        } catch (error) {
          debugError(
            `Discord reconcile error for ${subdomain}: ${
              (error as Error).message
            }`,
          );
        }
        await sleepUnlessLost(RECONCILE_INTERVAL, () => lost);
      }
    } finally {
      clearInterval(renew);
      ownedSubdomains.delete(subdomain);
      await teardownSubdomain(subdomain);
      try {
        await lock.release();
      } catch {
        // best-effort; if the lock was already lost the lease expires on its own
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
      const organizations = await getSaasOrganizations();
      for (const org of organizations) {
        ensureOwnerLoop(org.subdomain);
      }
    } catch (error) {
      debugError(`Discord SaaS discovery error: ${(error as Error).message}`);
    }
    await sleep(ORG_DISCOVERY_INTERVAL);
  }
};

export const initDiscord = () => {
  const VERSION = getEnv({ name: 'VERSION' });

  debugDiscord('Initializing Discord gateway distributor');

  startDistributing('os').catch((err) =>
    debugError(`Failed to start Discord distributor: ${err.message}`),
  );
};
