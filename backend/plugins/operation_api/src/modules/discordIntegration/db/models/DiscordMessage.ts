import { Model } from 'mongoose';
import { TDiscordNotificationEvent } from '@/discordIntegration/@types/discordNotification';
import {
  IDiscordMessageDocument,
  TDiscordCardKey,
} from '@/discordIntegration/@types/discordMessage';
import { DISCORD_CARD_CLAIM_TIMEOUT_MS } from '@/discordIntegration/constants';
import { discordMessageSchema } from '@/discordIntegration/db/definitions/discordMessage';
import { IModels } from '~/connectionResolvers';
import { isDuplicateKeyError } from '~/utils/mongoErrors';

export interface IDiscordMessageModel extends Model<IDiscordMessageDocument> {
  findCard(key: TDiscordCardKey): Promise<IDiscordMessageDocument | null>;
  claimCard(
    key: TDiscordCardKey,
    doc: { configId: string; lastEvent: TDiscordNotificationEvent },
  ): Promise<IDiscordMessageDocument | null>;
  saveCardMessage(
    _id: string,
    messageId: string,
    lastEvent: TDiscordNotificationEvent,
  ): Promise<void>;
  releaseCard(_id: string): Promise<void>;
}

export const loadDiscordMessageClass = (models: IModels) => {
  class DiscordMessageClass {
    public static async findCard(key: TDiscordCardKey) {
      return models.DiscordMessage.findOne(key).lean();
    }

    public static async claimCard(
      key: TDiscordCardKey,
      doc: { configId: string; lastEvent: TDiscordNotificationEvent },
    ) {
      try {
        return await models.DiscordMessage.findOneAndUpdate(
          {
            ...key,
            messageId: '',
            updatedAt: {
              $lt: new Date(Date.now() - DISCORD_CARD_CLAIM_TIMEOUT_MS),
            },
          },
          { $set: { ...doc, messageId: '' } },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        ).lean();
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          return null;
        }
        throw error;
      }
    }

    public static async saveCardMessage(
      _id: string,
      messageId: string,
      lastEvent: TDiscordNotificationEvent,
    ) {
      await models.DiscordMessage.updateOne(
        { _id },
        { $set: { messageId, lastEvent } },
      );
    }

    public static async releaseCard(_id: string) {
      await models.DiscordMessage.deleteOne({ _id, messageId: '' });
    }
  }

  discordMessageSchema.loadClass(DiscordMessageClass);

  return discordMessageSchema;
};
