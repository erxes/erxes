import { Model, model } from 'mongoose';
import { ActivityLogs } from '.';
import { fillSearchTextItem, watchItem } from './boardUtils';
import {
  growthHackSchema,
  IGrowthHack,
  IGrowthHackDocument
} from './definitions/growthHacks';

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

export const loadGrowthHackClass = () => {
  class GrowthHack {
    public static async getGrowthHack(_id: string) {
      const growthHack = await GrowthHacks.findOne({ _id });

      if (!growthHack) {
        throw new Error('Growth hack not found');
      }

      return growthHack;
    }

    /**
     * Create a growth hack
     */
    public static async createGrowthHack(doc: IGrowthHack) {
      const growthHack = await GrowthHacks.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
        searchText: fillSearchTextItem(doc)
      });

      // create log
      await ActivityLogs.createBoardItemLog({
        item: growthHack,
        contentType: 'growtHack'
      });

      return growthHack;
    }

    /**
     * Update growth hack
     */
    public static async updateGrowthHack(_id: string, doc: IGrowthHack) {
      const searchText = fillSearchTextItem(
        doc,
        await GrowthHacks.getGrowthHack(_id)
      );

      await GrowthHacks.updateOne({ _id }, { $set: doc, searchText });

      return GrowthHacks.findOne({ _id });
    }

    /**
     * Watch growth hack
     */
    public static watchGrowthHack(_id: string, isAdd: boolean, userId: string) {
      return watchItem(GrowthHacks, _id, isAdd, userId);
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

      await GrowthHacks.updateOne({ _id }, { $set: doc });

      return GrowthHacks.findOne({ _id });
    }
  }

  growthHackSchema.loadClass(GrowthHack);

  return growthHackSchema;
};

loadGrowthHackClass();

// tslint:disable-next-line
const GrowthHacks = model<IGrowthHackDocument, IGrowthHackModel>(
  'growth_hacks',
  growthHackSchema
);

export default GrowthHacks;
