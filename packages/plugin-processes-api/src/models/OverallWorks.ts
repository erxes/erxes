import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  IOverallWork,
  IOverallWorkDocument,
  overallWorkSchema
} from './definitions/overallWorks';

export interface IOverallWorkModel extends Model<IOverallWorkDocument> {
  getOverallWork(_id: string): Promise<IOverallWorkDocument>;
  createOverallWork(doc: IOverallWork): Promise<IOverallWorkDocument>;
  updateOverallWork(
    _id: string,
    doc: IOverallWork
  ): Promise<IOverallWorkDocument>;
  removeOverallWork(_id: string): void;
}

export const loadOverallWorkClass = (models: IModels) => {
  class OverallWork {
    /*
     * Get a overallWork
     */
    public static async getOverallWork(_id: string) {
      const overallWork = await models.OverallWorks.findOne({ _id });

      if (!overallWork) {
        throw new Error('OverallWork not found');
      }

      return overallWork;
    }

    /**
     * Create a overallWork
     */
    public static async createOverallWork(doc: IOverallWork) {
      const overallWork = await models.OverallWorks.create({
        ...doc,
        createdAt: new Date()
      });

      return overallWork;
    }

    /**
     * Update OverallWork
     */
    public static async updateOverallWork(_id: string, doc: IOverallWork) {
      await models.OverallWorks.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.OverallWorks.getOverallWork(_id);

      return updated;
    }

    /**
     * Remove OverallWork
     */
    public static async removeOverallWork(_id: string) {
      await models.OverallWorks.getOverallWork(_id);
      return models.OverallWorks.deleteOne({ _id });
    }
  }

  overallWorkSchema.loadClass(OverallWork);

  return overallWorkSchema;
};
