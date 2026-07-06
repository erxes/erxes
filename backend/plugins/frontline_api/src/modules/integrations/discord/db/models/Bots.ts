import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { discordBotSchema } from '@/integrations/discord/db/definitions/bots';
import {
  IDiscordBot,
  IDiscordBotDocument,
  IDiscordBotEditInput,
} from '@/integrations/discord/@types/bot';
import { getCurrentBotUser, sanitizeToken } from '@/integrations/discord/utils';
import { DISCORD_INBOX_KIND } from '@/integrations/discord/constants';
import { debugError } from '@/integrations/discord/debuggers';

export interface IDiscordBotModel extends Model<IDiscordBotDocument> {
  getBot(_id: string): Promise<IDiscordBotDocument>;
  getBots(
    filter: FilterQuery<IDiscordBotDocument>,
  ): Promise<IDiscordBotDocument[]>;
  createBot(
    doc: IDiscordBot & { createdBy: string; channelIds?: string[] },
  ): Promise<IDiscordBotDocument>;
  updateBot(
    _id: string,
    doc: IDiscordBotEditInput & { updatedBy: string },
  ): Promise<IDiscordBotDocument>;
  validateConnection(_id: string): Promise<IDiscordBotDocument>;
  ensureInboxIntegration(
    _id: string,
    userId?: string,
    channelIds?: string[],
  ): Promise<IDiscordBotDocument>;
  removeBot(_id: string): Promise<{ ok: number }>;
  detachIntegrationsFromChannels(integrationIds: string[]): Promise<void>;
  removeInboxConversations(integrationIds: string[]): Promise<void>;
  sweepOrphanIntegrations(graceMs?: number): Promise<number>;
}

export const loadDiscordBotClass = (models: IModels) => {
  // skipcq: JS-0327 — Mongoose's schema.loadClass() requires a class of statics.
  class DiscordBot {
    /** Fetch a bot by id, throwing if it does not exist. */
    public static async getBot(_id: string) {
      const bot = await models.DiscordBots.findOne({ _id });

      if (!bot) {
        throw new Error('Discord bot not found');
      }

      return bot;
    }

    /** List bots matching the filter, newest first. */
    public static getBots(
      filter: FilterQuery<IDiscordBotDocument>,
    ): Promise<IDiscordBotDocument[]> {
      return models.DiscordBots.find(filter).sort({ createdAt: -1 }).exec();
    }

    /** Create a bot, validate its token, then spin up its inbox integration. */
    public static async createBot(
      doc: IDiscordBot & { createdBy: string; channelIds?: string[] },
    ) {
      const { channelIds, ...botDoc } = doc;

      const bot = await models.DiscordBots.create({
        ...botDoc,
        token: sanitizeToken(botDoc.token),
        health: { status: 'syncing' },
      });

      const validated = await models.DiscordBots.validateConnection(bot._id);

      // Connect → create inbox Integration → link via erxesApiId. Only once the
      // token is confirmed valid (a broken bot shouldn't spawn an integration).
      if (validated.health?.isTokenValid) {
        try {
          return await models.DiscordBots.ensureInboxIntegration(
            bot._id,
            doc.createdBy,
            channelIds,
          );
        } catch (e) {
          debugError(
            `Failed to create inbox integration for bot ${bot._id}: ${
              (e as Error).message
            }`,
          );
        }
      }

      return validated;
    }

    /** Update a bot (re-sanitizing a rotated token) and re-validate its connection. */
    public static async updateBot(
      _id: string,
      doc: IDiscordBotEditInput & { updatedBy: string },
    ) {
      await models.DiscordBots.getBot(_id);

      // Sanitize the token on rotation: a pasted token routinely picks up
      // trailing newlines or zero-width chars that break the `Authorization`
      // ByteString, which would otherwise fail validateConnection with a
      // misleading "Invalid bot token". Only rewrite it when the edit includes
      // it — `sanitizeToken(undefined)` is `''`, so blindly sanitizing would
      // blank a token an edit didn't touch.
      const sanitized: IDiscordBotEditInput & { updatedBy: string } = {
        ...doc,
        ...(doc.token !== undefined
          ? { token: sanitizeToken(doc.token) }
          : {}),
      };

      await models.DiscordBots.findOneAndUpdate(
        { _id },
        { $set: sanitized },
        { new: true },
      );

      return models.DiscordBots.validateConnection(_id);
    }

    /**
     * Validates the bot token against Discord and records the outcome in
     * `health`. Called on every create/update so the connection status stays
     * in sync with the configuration — no manual step needed. Never throws:
     * an invalid token is surfaced via `health` rather than blocking the save.
     */
    public static async validateConnection(_id: string) {
      const bot = await models.DiscordBots.getBot(_id);

      /** Persist the given health snapshot and return the refreshed bot doc. */
      const setHealth = async (health: IDiscordBotDocument['health']) =>
        (await models.DiscordBots.findOneAndUpdate(
          { _id },
          { $set: { health } },
          { new: true },
        )) as IDiscordBotDocument;

      try {
        const botUser = await getCurrentBotUser(bot.token);

        return setHealth({
          status: 'healthy',
          isTokenValid: true,
          botUsername: botUser?.username,
          lastVerifiedAt: new Date(),
          lastError: undefined,
        });
      } catch (e) {
        debugError(
          `Discord token validation failed for bot ${_id}: ${
            (e as Error).message
          }`,
        );

        return setHealth({
          status: 'broken',
          isTokenValid: false,
          lastVerifiedAt: new Date(),
          lastError: 'Invalid bot token',
        });
      }
    }

    /**
     * Creates the inbox Integration that backs this bot and links it via
     * `erxesApiId`, then associates it with the given inbox channels. Idempotent:
     * a bot already linked is returned untouched, so this can be called from both
     * `createBot` and the gateway distributor (self-healing for bots created
     * directly in the DB). Mirrors Facebook's integration creation, minus the
     * core "add integration" UI round-trip — here the bot connection is the
     * trigger.
     */
    public static async ensureInboxIntegration(
      _id: string,
      userId?: string,
      channelIds: string[] = [],
    ) {
      const bot = await models.DiscordBots.getBot(_id);

      if (bot.erxesApiId) {
        return bot;
      }

      // Channel membership is what surfaces the conversation in agent inboxes,
      // and every inbox scoping query (conversation filter, sidebar) reads it
      // off the integration's own `channelId` — the same field core sets for
      // Facebook/messenger/etc. Discord setup may pass several inbox channels,
      // but the scoping model is one channel per integration, so we bind to the
      // first. An empty selection leaves it unscoped (system/owner-only), exactly
      // like any other integration created without a channel.
      const integration = await models.Integrations.createIntegration(
        {
          kind: DISCORD_INBOX_KIND,
          name: bot.name,
          channelId: channelIds[0] || '',
          brandId: '',
        },
        userId || '',
      );

      await models.DiscordBots.updateOne(
        { _id },
        { $set: { erxesApiId: integration._id } },
      );

      return models.DiscordBots.getBot(_id);
    }

    /**
     * Removes the integration's membership from every inbox channel. The
     * integration id is pushed into `Channels.integrationIds` on create
     * (`ensureInboxIntegration`); without this pull the reference lingers after
     * the integration is gone, leaving channels pointing at dead integrations.
     */
    public static async detachIntegrationsFromChannels(integrationIds: string[]) {
      if (!integrationIds.length) {
        return;
      }

      await models.Channels.updateMany(
        { integrationIds: { $in: integrationIds } },
        { $pull: { integrationIds: { $in: integrationIds } } },
      );
    }

    /**
     * Deletes the inbox conversations (and their messages) backed by the given
     * integrations. Removing an integration does *not* cascade to its
     * conversations, so without this they outlive the bot — and a later
     * automation firing on such a leftover conversation can no longer resolve a
     * bot ("Discord bot not found for this conversation").
     */
    public static async removeInboxConversations(integrationIds: string[]) {
      if (!integrationIds.length) {
        return;
      }

      const conversationIds = await models.Conversations.find({
        integrationId: { $in: integrationIds },
      }).distinct('_id');

      await models.ConversationMessages.deleteMany({
        conversationId: { $in: conversationIds },
      });
      await models.Conversations.deleteMany({
        integrationId: { $in: integrationIds },
      });
    }

    /** Delete a bot and tear down its integration, conversations, and mirrors. */
    public static async removeBot(_id: string) {
      const bot = await models.DiscordBots.getBot(_id);

      // Tear down the linked inbox integration and the local mirror so no
      // orphaned conversations/customers remain.
      if (bot.erxesApiId) {
        try {
          await models.DiscordBots.detachIntegrationsFromChannels([
            bot.erxesApiId,
          ]);
          await models.DiscordBots.removeInboxConversations([bot.erxesApiId]);
          await models.Integrations.removeIntegration(bot.erxesApiId);
        } catch (e) {
          debugError(
            `Failed to remove inbox integration ${bot.erxesApiId}: ${
              (e as Error).message
            }`,
          );
        }

        const conversationIds = await models.DiscordConversations.find({
          integrationId: bot.erxesApiId,
        }).distinct('_id');

        await models.DiscordCustomers.deleteMany({
          integrationId: bot.erxesApiId,
        });
        await models.DiscordConversations.deleteMany({
          integrationId: bot.erxesApiId,
        });
        await models.DiscordConversationMessages.deleteMany({
          conversationId: { $in: conversationIds },
        });
      }

      return models.DiscordBots.deleteOne({ _id });
    }

    /**
     * Reaps `discord-messenger` integration documents that no live bot points
     * at. A Discord integration is created per bot and linked via
     * `bot.erxesApiId`; if the bot is removed outside the coordinated teardown
     * (deleted directly in the DB, or left behind by an earlier plugin version),
     * its integration document leaks and keeps showing as a phantom channel in
     * the inbox sidebar. This is the safety net for those orphans.
     *
     * `graceMs` skips integrations created within the window: during creation
     * the integration document briefly exists before its bot is linked (core
     * creates the integration, then the message broker creates the bot), and we
     * must not reap one mid-creation.
     */
    public static async sweepOrphanIntegrations(graceMs = 10 * 60 * 1000) {
      const liveIds = (
        await models.DiscordBots.find({
          erxesApiId: { $nin: [null, ''] },
        }).distinct('erxesApiId')
      ).filter(Boolean);

      const orphanIds = await models.Integrations.find({
        kind: DISCORD_INBOX_KIND,
        _id: { $nin: liveIds },
        createdAt: { $lt: new Date(Date.now() - graceMs) },
      }).distinct('_id');

      if (!orphanIds.length) {
        return 0;
      }

      await models.DiscordBots.detachIntegrationsFromChannels(orphanIds);
      await models.DiscordBots.removeInboxConversations(orphanIds);

      // Drop the Discord-side mirror rows tied to the orphaned integrations too.
      const mirrorConversationIds = await models.DiscordConversations.find({
        integrationId: { $in: orphanIds },
      }).distinct('_id');
      await models.DiscordConversationMessages.deleteMany({
        conversationId: { $in: mirrorConversationIds },
      });
      await models.DiscordConversations.deleteMany({
        integrationId: { $in: orphanIds },
      });
      await models.DiscordCustomers.deleteMany({
        integrationId: { $in: orphanIds },
      });

      await models.Integrations.removeIntegrations(orphanIds);

      return orphanIds.length;
    }
  }

  return discordBotSchema.loadClass(DiscordBot);
};
