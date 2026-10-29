import { Model } from 'mongoose';
import {
  IDiscordUserLink,
  IDiscordUserLinkDocument,
} from '@/discordIntegration/@types/discordUserLink';
import { discordUserLinkSchema } from '@/discordIntegration/db/definitions/discordUserLink';
import { IModels } from '~/connectionResolvers';
import { isDuplicateKeyError } from '~/utils/mongoErrors';

const ALREADY_LINKED_MESSAGE =
  'This Discord account is linked to another member';

export interface IDiscordUserLinkModel extends Model<IDiscordUserLinkDocument> {
  linkAccount(link: IDiscordUserLink): Promise<IDiscordUserLinkDocument | null>;
}

export const loadDiscordUserLinkClass = (models: IModels) => {
  class DiscordUserLinkClass {
    public static async linkAccount(link: IDiscordUserLink) {
      const linkedElsewhere = await models.DiscordUserLink.exists({
        discordUserId: link.discordUserId,
        subdomain: link.subdomain,
        userId: { $ne: link.userId },
      });

      if (linkedElsewhere) {
        throw new Error(ALREADY_LINKED_MESSAGE);
      }

      try {
        return await models.DiscordUserLink.findOneAndUpdate(
          { userId: link.userId, subdomain: link.subdomain },
          { $set: link },
          { new: true, upsert: true, setDefaultsOnInsert: true },
        ).lean();
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          throw new Error(ALREADY_LINKED_MESSAGE);
        }
        throw error;
      }
    }
  }

  discordUserLinkSchema.loadClass(DiscordUserLinkClass);

  return discordUserLinkSchema;
};
