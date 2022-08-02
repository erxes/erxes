import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ITimeframe,
  ITimeframeDocument,
  timeframeSchema
} from './definitions/timeframes';

export interface ITimeframeModel extends Model<ITimeframeDocument> {
  timeframesEdit(doc: {
    add: ITimeframe[];
    update: ITimeframeDocument[];
  }): Promise<ITimeframeDocument[]>;
  timeframesRemove(_id: string): Promise<JSON>;
}

export const loadTimeframeClass = (models: IModels) => {
  class Timeframe {
    public static async timeframesEdit(doc: {
      add: ITimeframe[];
      update: ITimeframeDocument[];
    }) {
      const { add, update } = doc;

      for (const item of update) {
        await models.Timeframes.updateOne(
          { _id: item._id },
          { $set: { ...item } }
        );
      }

      const timeframe = await models.Timeframes.insertMany(add);

      return await timeframe;
    }

    public static async timeframesRemove(_id: string) {
      return await models.Timeframes.remove({ _id });
    }
  }

  timeframeSchema.loadClass(Timeframe);

  return timeframeSchema;
};
