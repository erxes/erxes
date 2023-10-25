import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  cpUserCardSchema,
  ICPUserCard,
  ICPUserCardDocument
} from './definitions/clientPortalUserCards';

export interface ICPUserCardModel extends Model<ICPUserCardDocument> {
  createOrUpdateCard(doc: ICPUserCard): Promise<ICPUserCardDocument>;
  getUserIds(contentType: string, contentTypeId: string): Promise<string[]>;
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
        contentType: doc.contentType,
        contentTypeId: doc.contentTypeId
      });

      if (!card) {
        return models.ClientPortalUserCards.create({
          ...doc,
          userId
        });
      }

      await models.ClientPortalUserCards.updateOne(
        { _id: card._id },
        {
          $set: {
            ...doc,
            modifiedAt: new Date()
          }
        }
      );

      return models.ClientPortalUserCards.findOne({
        _id: card._id
      });
    }

    /**
     * Get user ids
     * @param cardId
     * @return {Promise<string[]>}
     * @memberof CleintPortalUserCard
     */

    public static async getUserIds(contentType: string, contentTypeId: string) {
      // aggregate and return array of cpUserId field of ClientPortalUserCards
      const userIds = await models.ClientPortalUserCards.aggregate([
        {
          $match: {
            contentType,
            contentTypeId
          }
        },
        {
          $project: {
            cpUserId: 1
          }
        }
      ]);

      return userIds.map((user: any) => user.cpUserId);
    }
  }

  cpUserCardSchema.loadClass(CleintPortalUserCard);

  return cpUserCardSchema;
};
