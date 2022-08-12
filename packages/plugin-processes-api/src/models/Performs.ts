import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  IPerform,
  IPerformDocument,
  performSchema
} from './definitions/performs';

export interface IPerformModel extends Model<IPerformDocument> {
  getPerform(_id: string): Promise<IPerformDocument>;
  createPerform(doc: IPerform): Promise<IPerformDocument>;
  updatePerform(_id: string, doc: IPerform): Promise<IPerformDocument>;
  removePerform(_id: string): void;
}

export const loadPerformClass = (models: IModels) => {
  class Perform {
    /*
     * Get a perform
     */
    public static async getPerform(_id: string) {
      const perform = await models.Performs.findOne({ _id });

      if (!perform) {
        throw new Error('Perform not found');
      }

      return perform;
    }

    /**
     * Create a perform
     */
    public static async createPerform(doc: IPerform) {
      const perform = await models.Performs.create({
        ...doc,
        createdAt: new Date()
      });

      return perform;
    }

    /**
     * Update Perform
     */
    public static async updatePerform(_id: string, doc: IPerform) {
      await models.Performs.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.Performs.getPerform(_id);

      return updated;
    }

    /**
     * Remove Perform
     */
    public static async removePerform(_id: string) {
      await models.Performs.getPerform(_id);
      return models.Performs.deleteOne({ _id });
    }
  }

  performSchema.loadClass(Perform);

  return performSchema;
};
