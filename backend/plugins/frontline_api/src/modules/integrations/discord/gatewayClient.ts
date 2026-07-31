import { WebSocketManager, WebSocketShardEvents } from '@discordjs/ws';
import { REST } from '@discordjs/rest';
import {
  GatewayIntentBits,
  GatewayDispatchEvents,
  GatewayCloseCodes,
} from 'discord-api-types/v10';
import {
  mapMessageCreateToActivity,
  mapMessageDeleteToEvent,
  mapPollVoteToEvent,
  mapTypingStartToEvent,
} from '@/integrations/discord/activity';
import {
  DiscordActivity,
  DiscordMessageDeleteEvent,
  DiscordPollVoteEvent,
  DiscordTypingEvent,
} from '@/integrations/discord/@types/activity';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';

const DISCORD_INTENTS = (GatewayIntentBits.Guilds |
  GatewayIntentBits.GuildMessages |
  GatewayIntentBits.MessageContent |
  GatewayIntentBits.GuildMessagePolls |
  GatewayIntentBits.GuildMessageTyping) as GatewayIntentBits;

const FATAL_CLOSE_CODES = new Map<
  number,
  { reason: string; tokenValid: boolean }
>([
  [
    GatewayCloseCodes.AuthenticationFailed,
    { reason: 'Bot token is invalid or was revoked', tokenValid: false },
  ],
  [
    GatewayCloseCodes.DisallowedIntents,
    {
      reason:
        'A privileged intent is not enabled for this bot in the Discord Developer Portal',
      tokenValid: true,
    },
  ],
  [
    GatewayCloseCodes.InvalidIntents,
    { reason: 'Invalid gateway intents were requested', tokenValid: true },
  ],
  [
    GatewayCloseCodes.InvalidShard,
    { reason: 'Invalid gateway shard', tokenValid: true },
  ],
  [
    GatewayCloseCodes.ShardingRequired,
    { reason: 'This bot has grown large enough to require sharding', tokenValid: true },
  ],
  [
    GatewayCloseCodes.InvalidAPIVersion,
    { reason: 'Unsupported gateway API version', tokenValid: true },
  ],
]);

export type DiscordGatewayFatalClose = {
  code: number;
  reason: string;
  tokenValid: boolean;
};

export type DiscordGatewayConnection = {
  botId: string;
  manager: WebSocketManager;
  destroy: () => Promise<void>;
};

export type DiscordGatewayHandlers = {
  onMessage: (activity: DiscordActivity) => void | Promise<void>;
  onMessageEdit?: (activity: DiscordActivity) => void | Promise<void>;
  onMessageDelete?: (
    event: DiscordMessageDeleteEvent,
  ) => void | Promise<void>;
  onPollVote?: (event: DiscordPollVoteEvent) => void | Promise<void>;
  onTyping?: (event: DiscordTypingEvent) => void | Promise<void>;
  onFatalClose?: (info: DiscordGatewayFatalClose) => void | Promise<void>;
};

export const connectGateway = async ({
  botId,
  token,
  onMessage,
  onMessageEdit,
  onMessageDelete,
  onPollVote,
  onTyping,
  onFatalClose,
}: { botId: string; token: string } & DiscordGatewayHandlers): Promise<DiscordGatewayConnection> => {
  const rest = new REST({ version: '10' }).setToken(token);

  const manager = new WebSocketManager({
    token,
    intents: DISCORD_INTENTS,
    rest,
  });
  
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
      case GatewayDispatchEvents.MessageDelete:
      case GatewayDispatchEvents.MessageDeleteBulk:
        safely(
          'onMessageDelete',
          onMessageDelete,
          mapMessageDeleteToEvent(payload.d),
        );
        break;
      case GatewayDispatchEvents.MessagePollVoteAdd:
        safely('onPollVote', onPollVote, mapPollVoteToEvent(payload.d, true));
        break;
      case GatewayDispatchEvents.MessagePollVoteRemove:
        safely('onPollVote', onPollVote, mapPollVoteToEvent(payload.d, false));
        break;
      case GatewayDispatchEvents.TypingStart:
        safely('onTyping', onTyping, mapTypingStartToEvent(payload.d));
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
    const fatal = FATAL_CLOSE_CODES.get(code);

    if (!fatal) {
      debugDiscord(
        `Gateway closed for bot ${botId} (shard ${shardId}), code ${code}`,
      );
      return;
    }

    debugError(
      `Gateway closed permanently for bot ${botId} (shard ${shardId}), code ${code}: ${fatal.reason}`,
    );
    safely('onFatalClose', onFatalClose, { code, ...fatal });
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
