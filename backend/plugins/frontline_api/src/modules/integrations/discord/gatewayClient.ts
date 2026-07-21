import { WebSocketManager, WebSocketShardEvents } from '@discordjs/ws';
import { REST } from '@discordjs/rest';
import { GatewayIntentBits, GatewayDispatchEvents } from 'discord-api-types/v10';
import {
  mapMessageCreateToActivity,
  mapPollVoteToEvent,
} from '@/integrations/discord/activity';
import {
  DiscordActivity,
  DiscordPollVoteEvent,
} from '@/integrations/discord/@types/activity';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';

// Guilds + GuildMessages + MessageContent + GuildMessagePolls.
// MESSAGE_CONTENT is a *privileged* intent: it must be enabled on the bot in the
// Discord Developer Portal (and approved once the bot is in 100+ servers), or
// message payloads arrive with empty `content`. GuildMessagePolls is NOT
// privileged, so requesting it is always safe; it's what delivers
// MESSAGE_POLL_VOTE_ADD/REMOVE so vote tallies stay in sync. (`|` widens to
// number, hence the cast.) Note: member/presence triggers would need the
// privileged GuildMembers intent and are intentionally left out — requesting an
// unapproved privileged intent makes the Gateway reject the connection outright.
const DISCORD_INTENTS = (GatewayIntentBits.Guilds |
  GatewayIntentBits.GuildMessages |
  GatewayIntentBits.MessageContent |
  GatewayIntentBits.GuildMessagePolls) as GatewayIntentBits;

export type DiscordGatewayConnection = {
  botId: string;
  manager: WebSocketManager;
  destroy: () => Promise<void>;
};

export type DiscordGatewayHandlers = {
  onMessage: (activity: DiscordActivity) => void | Promise<void>;
  onMessageEdit?: (activity: DiscordActivity) => void | Promise<void>;
  onPollVote?: (event: DiscordPollVoteEvent) => void | Promise<void>;
};

/**
 * Opens a persistent Gateway (WebSocket) connection for one bot and routes
 * inbound events through the matching handler as normalized payloads:
 * `MESSAGE_CREATE`/`MESSAGE_UPDATE` → `DiscordActivity`,
 * `MESSAGE_POLL_VOTE_ADD`/`MESSAGE_POLL_VOTE_REMOVE` → `DiscordPollVoteEvent`.
 * The @discordjs/ws manager owns heartbeat / resume / reconnect; we only
 * translate payloads and surface lifecycle logs.
 */
export const connectGateway = async ({
  botId,
  token,
  onMessage,
  onMessageEdit,
  onPollVote,
}: { botId: string; token: string } & DiscordGatewayHandlers): Promise<DiscordGatewayConnection> => {
  const rest = new REST({ version: '10' }).setToken(token);

  const manager = new WebSocketManager({
    token,
    intents: DISCORD_INTENTS,
    rest,
  });

  // Runs a handler, swallowing/logging failures so one bad event can't tear
  // down the shard's dispatch loop.
  const safely = <T>(
    label: string,
    handler: ((arg: T) => void | Promise<void>) | undefined,
    arg: T,
  ) => {
    if (!handler) return;
    try {
      Promise.resolve(handler(arg)).catch((e) =>
        debugError(
          `${label} handler failed for bot ${botId}: ${(e as Error).message}`,
        ),
      );
    } catch (e) {
      debugError(
        `${label} handler failed for bot ${botId}: ${(e as Error).message}`,
      );
    }
  };

  manager.on(WebSocketShardEvents.Ready, (_data, shardId) => {
    debugDiscord(`Gateway ready for bot ${botId} (shard ${shardId})`);
  });

  manager.on(WebSocketShardEvents.Dispatch, (payload) => {
    switch (payload.t) {
      case GatewayDispatchEvents.MessageCreate:
        safely('onMessage', onMessage, mapMessageCreateToActivity(payload.d));
        break;
      case GatewayDispatchEvents.MessageUpdate:
        safely(
          'onMessageEdit',
          onMessageEdit,
          mapMessageCreateToActivity(payload.d),
        );
        break;
      case GatewayDispatchEvents.MessagePollVoteAdd:
        safely('onPollVote', onPollVote, mapPollVoteToEvent(payload.d, true));
        break;
      case GatewayDispatchEvents.MessagePollVoteRemove:
        safely('onPollVote', onPollVote, mapPollVoteToEvent(payload.d, false));
        break;
      default:
        break;
    }
  });

  manager.on(WebSocketShardEvents.Error, (error, shardId) => {
    debugError(
      `Gateway error for bot ${botId} (shard ${shardId}): ${error.message}`,
    );
  });

  manager.on(WebSocketShardEvents.Closed, (code, shardId) => {
    debugDiscord(
      `Gateway closed for bot ${botId} (shard ${shardId}), code ${code}`,
    );
  });

  await manager.connect();

  return {
    botId,
    manager,
    destroy: async () => {
      await manager.destroy();
    },
  };
};
