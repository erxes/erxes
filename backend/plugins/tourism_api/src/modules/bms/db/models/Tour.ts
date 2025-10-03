import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import { ITour, ITourDocument } from '@/bms/@types/tour';
import { tourSchema } from '@/bms/db/definitions/tour';

export interface ITourModel extends Model<ITourDocument> {
  createTour(doc: ITour, user: any): Promise<ITourDocument>;
  getTour(_id: string): Promise<ITourDocument>;
  updateTour(_id: string, doc: ITour): Promise<ITourDocument>;
  removeTour(ids: string[]): Promise<ITourDocument>;
}

export const loadTourClass = (models: IModels) => {
  class Tour {
    /**
     * Retrieves tour
     */
    public static async getTour(_id: string) {
      const element = await models.Tours.findOne({ _id });
      if (!element) {
        throw new Error('Tour not found');
      }
      return element;
    }
    /**
     * Create a tour
     */
    public static async createTour(doc, user) {
      const element = await models.Tours.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });
      return element;
    }

    /**
     * Update tour
     */
    public static async updateTour(_id, doc) {
      await models.Tours.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } },
      );

      return await models.Tours.findOne({ _id });
    }

    /**
     * Remove tour
     */
    public static async removeTour(ids) {
      return models.Tours.deleteMany({ _id: { $in: ids } });
    }
  }
  tourSchema.loadClass(Tour);
  return tourSchema;
};
