import { Model } from 'mongoose';
import { fillSearchTextItem, createBoardItem, watchItem } from './utils';
import {
  growthHackSchema,
  IGrowthHack,
  IGrowthHackDocument
} from './definitions/growthHacks';
import { IModels } from '../connectionResolver';

export interface IGrowthHackModel extends Model<IGrowthHackDocument> {
  getGrowthHack(_id: string): Promise<IGrowthHackDocument>;
  createGrowthHack(doc: IGrowthHack): Promise<IGrowthHackDocument>;
  updateGrowthHack(_id: string, doc: IGrowthHack): Promise<IGrowthHackDocument>;
  watchGrowthHack(_id: string, isAdd: boolean, userId: string): void;
  voteGrowthHack(
    _id: string,
    isVote: boolean,
    userId: string
  ): Promise<IGrowthHackDocument>;
}

export const loadGrowthHackClass = (models: IModels, subdomain: string) => {
  class GrowthHack {
    public static async getGrowthHack(_id: string) {
      const growthHack = await models.GrowthHacks.findOne({ _id });

      if (!growthHack) {
        throw new Error('Growth hack not found');
      }

      return growthHack;
    }

    /**
     * Create a growth hack
     */
    public static async createGrowthHack(doc: IGrowthHack) {
      return createBoardItem(models, subdomain, doc, 'growthHack');
    }

    /**
     * Update growth hack
     */
    public static async updateGrowthHack(_id: string, doc: IGrowthHack) {
      const searchText = fillSearchTextItem(
        doc,
        await models.GrowthHacks.getGrowthHack(_id)
      );

      await models.GrowthHacks.updateOne({ _id }, { $set: doc, searchText });

      return models.GrowthHacks.findOne({ _id });
    }

    /**
     * Watch growth hack
     */
    public static watchGrowthHack(_id: string, isAdd: boolean, userId: string) {
      return watchItem(models.GrowthHacks, _id, isAdd, userId);
    }

    /**
     * Vote growth hack
     */
    public static async voteGrowthHack(
      _id: string,
      isVote: boolean,
      userId: string
    ) {
      const growthHack = await GrowthHack.getGrowthHack(_id);

      let votedUserIds = growthHack.votedUserIds || [];
      let voteCount = growthHack.voteCount || 0;

      if (isVote) {
        votedUserIds.push(userId);

        voteCount++;
      } else {
        votedUserIds = votedUserIds.filter(id => id !== userId);

        voteCount--;
      }

      const doc = { votedUserIds, voteCount };

      await models.GrowthHacks.updateOne({ _id }, { $set: doc });

      return models.GrowthHacks.findOne({ _id });
    }
  }

  growthHackSchema.loadClass(GrowthHack);

  return growthHackSchema;
};