import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  ITour,
  ITourCategory,
  ITourCategoryDocument,
  ITourDocument,
} from '@/bms/@types/tour';
import { tourCategorySchema, tourSchema } from '@/bms/db/definitions/tour';

export interface ITourModel extends Model<ITourDocument> {
  createTour(doc: ITour, user: any): Promise<ITourDocument>;
  getTour(_id: string): Promise<ITourDocument>;
  updateTour(_id: string, doc: ITour): Promise<ITourDocument>;
  removeTour(ids: string[]): Promise<ITourDocument>;
}

export interface IBmsTourCategoryModel extends Model<ITourCategoryDocument> {
  getTourCategory(selector: any): Promise<ITourCategoryDocument>;
  createTourCategory(doc: ITourCategory): Promise<ITourCategoryDocument>;
  updateTourCategory(
    _id: string,
    doc: ITourCategory,
  ): Promise<ITourCategoryDocument>;
  removeTourCategory(_id: string): Promise<any>;
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

export const loadTourCategoryClass = (models: IModels) => {
  class TourCategory {
    public static async getTourCategory(selector: any) {
      const category = await models.BmsTourCategories.findOne(selector);

      if (!category) {
        throw new Error('Tour category not found');
      }

      return category;
    }

    public static async createTourCategory(doc) {
      return models.BmsTourCategories.create(doc);
    }

    public static async updateTourCategory(_id, doc) {
      await models.BmsTourCategories.getTourCategory({ _id });

      const parentCategory = doc.parentId
        ? await models.BmsTourCategories.findOne({ _id: doc.parentId }).lean()
        : undefined;

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      await models.BmsTourCategories.updateOne({ _id }, { $set: doc });

      return models.BmsTourCategories.findOne({ _id });
    }

    public static async removeTourCategory(_id) {
      await models.BmsTourCategories.getTourCategory({ _id });

      let count = await models.Tours.countDocuments({ categories: _id });

      count += await models.BmsTourCategories.countDocuments({ parentId: _id });

      if (count > 0) {
        throw new Error("Can't remove a category");
      }

      return models.BmsTourCategories.deleteOne({ _id });
    }
  }

  tourCategorySchema.loadClass(TourCategory);

  return tourCategorySchema;
};
