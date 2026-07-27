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
  getBotsByInboxChannel(channelId: string): Promise<IDiscordBotDocument[]>;
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
    public static async getBot(_id: string) {
      const bot = await models.DiscordBots.findOne({ _id });

      if (!bot) {
        throw new Error('Discord bot not found');
      }

      return bot;
    }

    public static getBots(
      filter: FilterQuery<IDiscordBotDocument>,
    ): Promise<IDiscordBotDocument[]> {
      return models.DiscordBots.find(filter).sort({ createdAt: -1 }).exec();
    }

    public static async getBotsByInboxChannel(
      channelId: string,
    ): Promise<IDiscordBotDocument[]> {
      if (!channelId) {
        return [];
      }

      const integrationIds = await models.Integrations.find({
        kind: DISCORD_INBOX_KIND,
        channelId,
      }).distinct('_id');

      if (!integrationIds.length) {
        return [];
      }

      return models.DiscordBots.find({
        erxesApiId: { $in: integrationIds },
      })
        .sort({ createdAt: -1 })
        .exec();
    }

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

    public static async updateBot(
      _id: string,
      doc: IDiscordBotEditInput & { updatedBy: string },
    ) {
      await models.DiscordBots.getBot(_id);

      const sanitized: IDiscordBotEditInput & { updatedBy: string } = {
        ...doc,
        ...(doc.token === undefined ? {} : { token: sanitizeToken(doc.token) }),
      };

      await models.DiscordBots.findOneAndUpdate(
        { _id },
        { $set: sanitized },
        { new: true },
      );

      return models.DiscordBots.validateConnection(_id);
    }

    public static async validateConnection(_id: string) {
      const bot = await models.DiscordBots.getBot(_id);

      const setHealth = async (health: IDiscordBotDocument['health']) =>
        (await models.DiscordBots.findOneAndUpdate(
          { _id },
          {
            $set: {
              health: {
                ...health,
                backfillPending: bot.health?.backfillPending,
              },
            },
          },
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

    public static async ensureInboxIntegration(
      _id: string,
      userId?: string,
      channelIds: string[] = [],
    ) {
      const bot = await models.DiscordBots.getBot(_id);

      if (bot.erxesApiId) {
        return bot;
      }

      const integration = await models.Integrations.createIntegration(
        {
          kind: DISCORD_INBOX_KIND,
          name: bot.name,
          channelId: channelIds[0] || '',
          brandId: '',
        },
        userId || '',
      );

      const claimed = await models.DiscordBots.findOneAndUpdate(
        { _id, $or: [{ erxesApiId: null }, { erxesApiId: '' }] },
        { $set: { erxesApiId: integration._id } },
        { new: true },
      );

      if (!claimed) {
        await models.Integrations.removeIntegration(integration._id).catch(
          (e) =>
            debugError(
              `Failed to remove duplicate inbox integration ${
                integration._id
              }: ${(e as Error).message}`,
            ),
        );

        return models.DiscordBots.getBot(_id);
      }

      return claimed;
    }

    public static async detachIntegrationsFromChannels(
      integrationIds: string[],
    ) {
      if (!integrationIds.length) {
        return;
      }

      await models.Channels.updateMany(
        { integrationIds: { $in: integrationIds } },
        { $pull: { integrationIds: { $in: integrationIds } } },
      );
    }

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

    public static async removeBot(_id: string) {
      const bot = await models.DiscordBots.getBot(_id);

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
