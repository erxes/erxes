import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { IUserCard, IUserCardDocument } from '@/portal/@types/userCard';
import { userCardSchema } from '@/portal/db/definitions/userCard';

export interface IUserCardModel extends Model<IUserCardDocument> {
  createOrUpdateCard(doc: IUserCard): Promise<IUserCardDocument>;
  getUserIds(contentType: string, contentTypeId: string): Promise<string[]>;
}

export const loadUserCardClass = (models: IModels) => {
  class UserCard {
    /**
     * Creates a new user card or updates an existing one based on the provided document.
     *
     * @param {IUserCard} doc - The user card document containing details of the card.
     * @param {string} userId - The ID of the user associated with the card.
     * @returns {Promise<IUserCardDocument>} - A promise that resolves to the created or updated user card document.
     */
    public static async createOrUpdateCard(doc: IUserCard, userId: string) {
      const card = await models.UserCards.findOne({
        contentType: doc.contentType,
        contentTypeId: doc.contentTypeId,
      });

      if (!card) {
        return models.UserCards.create({
          ...doc,
          userId,
        });
      }

      await models.UserCards.updateOne(
        { _id: card._id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date(),
          },
        },
      );

      return models.UserCards.findOne({
        _id: card._id,
      });
    }

    /**
     * Get user ids
     * @param contentType
     * @param contentTypeId
     * @return {Promise<string[]>} array of portalUserId field of UserCards
     * @memberof UserCard
     */
    public static async getUserIds(contentType: string, contentTypeId: string) {
      // aggregate and return array of portalUserId field of UserCards
      const cards = await models.UserCards.aggregate([
        {
          $match: {
            contentType,
            contentTypeId,
          },
        },
        {
          $project: {
            portalUserId: 1,
          },
        },
      ]);

      return cards.map((user: any) => user.portalUserId);
    }
  }

  userCardSchema.loadClass(UserCard);

  return userCardSchema;
};
