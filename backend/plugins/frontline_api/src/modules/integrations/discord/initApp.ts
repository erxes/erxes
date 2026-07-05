import {
  getEnv,
  getSaasOrganizations,
  getSaasCoreConnection,
} from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
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
import { getChannel, isThreadChannel } from '@/integrations/discord/utils';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';

const { NODE_ENV } = process.env;

// Live Gateway connections keyed by `subdomain:token`. A Discord bot (token)
// opens a single socket that serves every channel it's configured for; each
// inbound message is routed to the integration that owns that channel. Keying by
// token (not botId) lets multiple channel-integrations sharing a token reuse one
// socket instead of opening duplicate connections.
//
// The subdomain is part of the key because a single Discord bot can be added to
// many servers, so two SaaS orgs may configure the same token. Each org routes
// into its own models, so each needs its own socket — keying by token alone
// would let the first org's socket win and silently drop the second org's
// messages (its `connectDiscordToken` returns early on `connections.has`).
const connectionKey = (subdomain: string, token: string) =>
  `${subdomain}:${token}`;
const connections = new Map<string, DiscordGatewayConnection>();

// Subdomains this replica currently owns (holds the redlock for). Only an owner
// may open sockets — this is what turns the lock into a real gate instead of
// decorative bookkeeping. A mutation that lands on a non-owner replica no-ops;
// the owner's reconcile loop opens the socket on its next pass.
const ownedSubdomains = new Set<string>();

// subdomain → the tokens this replica opened while owning that subdomain. Lets
// `reconcileSubdomain` close sockets for removed bots and lets ownership-loss
// tear everything down cleanly, so two replicas never stream the same bot.
const ownedTokens = new Map<string, Set<string>>();

// Subdomains that already have a running owner loop in this process, so the
// SaaS org-discovery tick doesn't spawn duplicate loops.
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

// channelId → parentId (or null when the channel is top-level / unknown). A
// thread's parent never changes, so this mapping is immutable and safe to cache
// for the process lifetime. It keeps the parent-fallback in `resolveBot` from
// hitting the Discord REST API more than once per distinct channel id.
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
    // Only thread channel types carry a `parent_id` on the APIChannel union.
    parentId = (channel && isThreadChannel(channel) && channel.parent_id) || null;
  } catch (e) {
    // Transient failure (500/timeout/network): don't cache. Caching null here
    // would permanently un-route this channel for the process lifetime, since a
    // single blip would drop every future message in the thread. Leaving it
    // uncached means the next message retries the lookup instead.
    debugError(
      `Failed to resolve parent for Discord channel ${channelId}: ${
        (e as Error).message
      }`,
    );
    return null;
  }

  // Only cache confirmed resolutions — the parent (or confirmed absence of one)
  // never changes, so this is safe to keep for the process lifetime.
  channelParentCache.set(channelId, parentId);
  return parentId;
};

/**
 * Opens (once per token) a Gateway connection and routes each inbound message to
 * the Discord integration configured for that message's channel — so different
 * Discord channels land in different inbox integrations/Team-Inbox channels.
 * Idempotent by token; no-op unless the token has a healthy, linked bot.
 */
export const connectDiscordToken = async (subdomain: string, token: string) => {
  if (!token || connections.has(connectionKey(subdomain, token))) {
    return;
  }

  // The gate: only the replica that owns this subdomain's Discord work may open
  // a socket. On any other replica this is a no-op — the owner's reconcile loop
  // opens it within one reconcile cycle. Without this, every replica opens its
  // own socket per token and each Discord message is ingested once per replica.
  if (!ownedSubdomains.has(subdomain)) {
    return;
  }

  const models = await generateModels(subdomain);

  // Only open the socket once at least one channel-integration is ready.
  const readyBot = await models.DiscordBots.findOne({
    token,
    'health.status': 'healthy',
    erxesApiId: { $nin: [null, ''] },
  });

  if (!readyBot) {
    return;
  }

  const label = readyBot.applicationId || 'discord';

  // A bot can serve an event only if it's the one configured for this token,
  // healthy, and linked to an inbox integration.
  const usableBot = (bot: IDiscordBotDocument | null) =>
    bot && bot.health?.status === 'healthy' && bot.erxesApiId ? bot : null;

  // Route a Gateway event (by its Discord channel) to the healthy, linked bot
  // that owns that channel. Shared by every event handler below so they all
  // resolve the same integration consistently. Returns `null` when no
  // integration is configured for the channel.
  //
  // Threads have their own channel id (distinct from the parent channel), so a
  // direct match misses. We fall back to the thread's parent channel: the
  // message routes to the parent's integration, but downstream keying by the
  // thread's own channelId still gives each thread its own inbox conversation,
  // labeled with the thread name.
  const resolveBot = async (channelId?: string) => {
    if (!channelId) {
      return null;
    }

    // Newest-first: when more than one bot exists for the same (token,
    // channelId) — e.g. a channel deleted + re-added with different settings —
    // the most recently configured bot is the correct one. An undeterministic
    // `findOne` could bind the message to a stale bot, so a channel reconfigured
    // as group chat would keep ingesting per-person under the old bot.
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
          if (!bot) return; // no integration for this Discord channel
          await receiveDiscordMessage({ models, subdomain, bot, activity });
        } catch (e) {
          debugError(
            `Discord message routing failed: ${(e as Error).message}`,
          );
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

    connections.set(connectionKey(subdomain, token), connection);
    trackOwnedToken(subdomain, token);
    debugDiscord(`Connected Discord gateway for app ${label} (${subdomain})`);
  } catch (e) {
    debugError(`Failed to connect Discord gateway: ${(e as Error).message}`);
  }
};

/**
 * Convenience wrapper used by the connect-on-create hook: ensures the Gateway
 * connection for a bot's token exists.
 */
export const connectDiscordBot = async (
  subdomain: string,
  bot: IDiscordBotDocument,
) => {
  if (bot.health?.status !== 'healthy' || !bot.erxesApiId) {
    return;
  }
  await connectDiscordToken(subdomain, bot.token);
};

/**
 * Closes and forgets the Gateway connection this subdomain opened for a token.
 * Called when the last channel-integration for that token is removed. Scoped by
 * subdomain so closing one org's socket never touches another org that happens
 * to share the same bot token.
 */
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

  // Keep ownership bookkeeping in step with the live sockets, whether the close
  // came from reconcile, a removal mutation, or ownership teardown.
  untrackToken(subdomain, token);
};

// Tunables. Renew well inside the lease so a missed renewal is detected with
// margin before the lease expires and a peer can take over; reconcile often
// enough that newly-created bots connect promptly without hammering the DB.
const LOCK_TTL = 30_000; // lock lease length
const LOCK_RENEW_INTERVAL = 10_000; // renew at ~1/3 of the TTL
const RECONCILE_INTERVAL = 30_000; // converge live sockets to DB state
const ACQUIRE_RETRY_INTERVAL = 30_000; // wait before retrying a contended lock
const ORG_DISCOVERY_INTERVAL = 10 * 60 * 1000; // SaaS: re-scan the org list

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Sleep that wakes early once `isLost()` flips, so a replica that has lost the
// lock tears its sockets down quickly instead of after a full reconcile cycle.
const sleepUnlessLost = async (ms: number, isLost: () => boolean) => {
  let waited = 0;
  while (waited < ms && !isLost()) {
    const step = Math.min(2000, ms - waited);
    await sleep(step);
    waited += step;
  }
};

/**
 * Converges the live Gateway sockets for a subdomain to its DB state: opens a
 * socket for every healthy, inbox-linked bot token, and closes any socket this
 * replica owns whose bot is gone or no longer healthy. Run only by the current
 * owner (the gate in `connectDiscordToken` enforces that). This is the single
 * source of truth — mutations only write the DB; reconcile reflects it.
 */
const reconcileSubdomain = async (subdomain: string) => {
  const models = await generateModels(subdomain);

  // Reap integration documents left behind by bots removed outside the
  // coordinated teardown, so the inbox sidebar can't show phantom channels.
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

  const bots = await models.DiscordBots.find({ 'health.status': 'healthy' });

  // Desired = the distinct tokens of healthy bots linked to an inbox
  // integration. Multiple channel-integrations can share one token → one socket.
  const desired = new Set<string>();
  for (const rawBot of bots) {
    // Self-heal: a bot created directly in the DB won't have an inbox
    // integration — create + link it before connecting.
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

  // Open desired sockets that aren't up yet (idempotent by token).
  for (const token of desired) {
    await connectDiscordToken(subdomain, token);
  }

  // Close sockets we own for this subdomain that are no longer desired (bot
  // deleted or unhealthy) — the teardown the old distributor never did.
  const owned = ownedTokens.get(subdomain);
  if (owned) {
    for (const token of [...owned]) {
      if (!desired.has(token)) {
        await disconnectDiscordToken(subdomain, token);
      }
    }
  }
};

/**
 * Closes every socket this replica opened for a subdomain and forgets them.
 * Called when the replica gives up ownership so the next owner doesn't end up
 * running a second socket for the same bot.
 */
const teardownSubdomain = async (subdomain: string) => {
  const owned = ownedTokens.get(subdomain);
  if (!owned) {
    return;
  }
  for (const token of [...owned]) {
    await disconnectDiscordToken(subdomain, token);
  }
  ownedTokens.delete(subdomain);
};

/**
 * Owns one subdomain's Discord work for as long as it can hold the lock. The
 * lock now does two jobs: (1) a gate — acquiring it is what permits opening
 * sockets; (2) ownership — it's renewed for the whole time sockets are held, and
 * losing it tears those sockets down. Exactly one replica owns a subdomain at a
 * time; the rest sit in the acquire-retry path as hot standbys and take over on
 * owner death once the lease expires.
 */
const runOwnerLoop = async (subdomain: string) => {
  const key = `${subdomain}:discord:work_distributor`;

  while (true) {
    let lock: TDiscordLock;
    try {
      lock = await redlock.acquire([key], LOCK_TTL);
    } catch {
      // Held by another replica (or locking unavailable): we are NOT the owner.
      // Open nothing; wait and retry — we take over if that replica dies.
      await sleep(ACQUIRE_RETRY_INTERVAL);
      continue;
    }

    ownedSubdomains.add(subdomain);
    let lost = false;

    // Keep the lease alive for as long as we hold sockets. A failed renew means
    // we have lost ownership (Redis partition / GC pause past the TTL): stop,
    // tear down, and let whoever holds the lock now own the sockets.
    const renew = setInterval(async () => {
      try {
        lock = await lock.extend(LOCK_TTL); // v5: extend returns a fresh Lock
      } catch {
        lost = true;
      }
    }, LOCK_RENEW_INTERVAL);

    try {
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
      // Stop allowing opens immediately, then drop our sockets before the next
      // owner opens its own.
      ownedSubdomains.delete(subdomain);
      await teardownSubdomain(subdomain);
      try {
        await lock.release();
      } catch {
        // best-effort; if the lock was already lost the lease expires on its own
      }
    }
    // lost → loop back and try to re-acquire (we may become owner again later).
  }
};

/**
 * Starts a single owner loop per subdomain in this process. Idempotent: the
 * SaaS org-discovery tick calls it for every org on every pass, but only the
 * first call per subdomain spawns a loop.
 */
const ensureOwnerLoop = (subdomain: string) => {
  if (!subdomain || ownerLoops.has(subdomain)) {
    return;
  }
  ownerLoops.add(subdomain);
  runOwnerLoop(subdomain).catch((error) => {
    ownerLoops.delete(subdomain); // allow a restart on the next discovery tick
    debugError(
      `Discord owner loop crashed for ${subdomain}: ${(error as Error).message}`,
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

  // Discover orgs forever and ensure each has an owner loop; orgs created later
  // are picked up on the next pass. Existing loops are left running.
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

/**
 * Wired into the plugin's `onServerInit`. Mirrors the IMAP integration: per
 * subdomain (or per SaaS org) it opens one Gateway connection per healthy bot,
 * guarded by a Redis lock so only one replica owns each socket. The loops run
 * forever, so this is fire-and-forget (not awaited).
 */
export const initDiscord = () => {
  const VERSION = getEnv({ name: 'VERSION' });

  debugDiscord('Initializing Discord gateway distributor');

  if (VERSION === 'saas') {
    startSaasDistributing().catch((err) =>
      debugError(`Failed to start Discord SaaS distributor: ${err.message}`),
    );
  } else {
    startDistributing('os').catch((err) =>
      debugError(`Failed to start Discord distributor: ${err.message}`),
    );
  }
};
