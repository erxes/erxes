import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { IWork, IWorkDocument, workSchema } from './definitions/works';

export interface IWorkModel extends Model<IWorkDocument> {
  getWork(_id: string): Promise<IWorkDocument>;
  createWork(doc: IWork): Promise<IWorkDocument>;
  updateWork(_id: string, doc: IWork): Promise<IWorkDocument>;
  removeWork(_id: string): void;
}

export const loadWorkClass = (models: IModels) => {
  class Work {
    /*
     * Get a work
     */
    public static async getWork(_id: string) {
      const work = await models.Works.findOne({ _id });

      if (!work) {
        throw new Error('Work not found');
      }

      return work;
    }

    /**
     * Create a work
     */
    public static async createWork(doc: IWork) {
      const work = await models.Works.create({
        ...doc,
        createdAt: new Date()
      });

      return work;
    }

    /**
     * Update Work
     */
    public static async updateWork(_id: string, doc: IWork) {
      await models.Works.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.Works.getWork(_id);

      return updated;
    }

    /**
     * Remove Work
     */
    public static async removeWork(_id: string) {
      await models.Works.getWork(_id);
      return models.Works.deleteOne({ _id });
    }
  }

  workSchema.loadClass(Work);

  return workSchema;
};
