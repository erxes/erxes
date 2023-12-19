import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ITimeframe,
  ITimeframeDocument,
  timeframeSchema
} from './definitions/timeframes';

export interface ITimeframeModel extends Model<ITimeframeDocument> {
  timeframesEdit(
    doc: (ITimeframe & { _id?: string })[]
  ): Promise<ITimeframeDocument[]>;
}

export const loadTimeframeClass = (models: IModels) => {
  class Timeframe {
    public static async timeframesEdit(doc: (ITimeframe & { _id?: string })[]) {
      const insertDocs: ITimeframe[] = [];
      const updateDocs: any[] = [];

      for (const item of doc) {
        if (!item._id) {
          insertDocs.push(item);
          continue;
        }

        updateDocs.push({
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { ...item, status: '' } }
          }
        });
      }

      await models.Timeframes.updateMany(
        { status: { $ne: 'deleted' } },
        { $set: { status: 'deleted' } }
      );

      if (updateDocs.length) {
        await models.Timeframes.bulkWrite(updateDocs);
      }

      if (insertDocs.length) {
        await models.Timeframes.insertMany(insertDocs);
      }

      return await models.Timeframes.find({
        status: { $ne: 'deleted' }
      })
        .sort({ startTime: 1 })
        .lean();
    }
  }

  timeframeSchema.loadClass(Timeframe);

  return timeframeSchema;
};
