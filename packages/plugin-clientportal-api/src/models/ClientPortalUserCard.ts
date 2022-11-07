import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  cpUserCardSchema,
  ICPUserCard,
  ICPUserCardDocument
} from './definitions/clientPortalUserCards';

export interface ICPUserCardModel extends Model<ICPUserCardDocument> {
  createOrUpdateCard(
    doc: ICPUserCard,
    userId: string
  ): Promise<ICPUserCardDocument>;
  removeUserFromCard(
    cardId: string,
    userId: string
  ): Promise<ICPUserCardDocument>;
  getUserIds(type: string, cardId: string): Promise<string[]>;
}

export const loadUserCardClass = (models: IModels) => {
  class CleintPortalUserCard {
    /**
     * create or update card
     * @param {Object} doc - card object
     * @param {String} userId - user id
     * @return {Promise} return card object
     */
    public static async createOrUpdateCard(doc: ICPUserCard, userId: string) {
      const card = await models.ClientPortalUserCards.findOne({
        type: doc.type,
        cardId: doc.cardId
      });

      if (!card) {
        return models.ClientPortalUserCards.create({
          ...doc,
          userIds: [userId]
        });
      }

      if (card.userIds.indexOf(userId) === -1) {
        card.userIds.push(userId);

        await card.save();

        return card;
      } else {
        return card;
      }
    }

    /**
     * Remove user from card
     * @param cardId
     * @param userId
     * @return {Promise<ICPUserCardDocument>}
     * @memberof CleintPortalUserCard
     */

    public static async removeUserFromCard(cardId: string, userId: string) {
      const card = await models.ClientPortalUserCards.findOne({
        cardId
      });

      if (!card) {
        throw new Error('Card not found');
      }

      const index = card.userIds.indexOf(userId);

      if (index > -1) {
        card.userIds.splice(index, 1);
      }

      await card.save();

      if (card.userIds.length === 0) {
        await card.remove();
      }

      return card;
    }

    /**
     * Get user ids
     * @param cardId
     * @return {Promise<string[]>}
     * @memberof CleintPortalUserCard
     */

    public static async getUserIds(type: string, cardId: string) {
      const card = await models.ClientPortalUserCards.findOne({
        cardId,
        type
      });

      if (!card) {
        throw new Error('Card not found');
      }

      return card.userIds;
    }
  }

  cpUserCardSchema.loadClass(CleintPortalUserCard);

  return cpUserCardSchema;
};
