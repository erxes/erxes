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
  removeTourCategory(ids: string[]): Promise<any>;
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
      const parentCategory = doc.parentId
        ? await models.BmsTourCategories.findOne({ _id: doc.parentId }).lean()
        : undefined;

      doc.order = await this.generateOrder(parentCategory, doc);

      return models.BmsTourCategories.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });
    }

    public static async updateTourCategory(_id, doc) {
      const existingCategory = await models.BmsTourCategories.getTourCategory({
        _id,
      });

      const parentIdToUse =
        doc.parentId !== undefined ? doc.parentId : existingCategory.parentId;

      const parentCategory = parentIdToUse
        ? await models.BmsTourCategories.findOne({ _id: parentIdToUse }).lean()
        : undefined;

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }
      const mergedDoc = {
        ...existingCategory.toObject(),
        ...doc,
      };
      const oldOrder = existingCategory.order;
      doc.order = await this.generateOrder(parentCategory, mergedDoc);
      doc.modifiedAt = new Date();

      await models.BmsTourCategories.updateOne({ _id }, { $set: doc });

      if (oldOrder && oldOrder !== doc.order) {
        const escapeRegExp = (value: string) =>
          value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const childCategories = await models.BmsTourCategories.find({
          $and: [
            { order: { $regex: new RegExp(`^${escapeRegExp(oldOrder)}`) } },
            { _id: { $ne: _id } },
          ],
        });

        for (const childCategory of childCategories) {
          if (!childCategory.order || !doc.order) {
            continue;
          }

          const order = childCategory.order.replace(oldOrder, doc.order);

          await models.BmsTourCategories.updateOne(
            { _id: childCategory._id },
            { $set: { order, modifiedAt: new Date() } },
          );
        }
      }

      return models.BmsTourCategories.findOne({ _id });
    }

    public static async removeTourCategory(ids) {
      const uniqueIds = [...new Set((ids || []).filter(Boolean))];

      if (!uniqueIds.length) {
        throw new Error('Category ids are required');
      }

      const existingCount = await models.BmsTourCategories.countDocuments({
        _id: { $in: uniqueIds },
      });

      if (existingCount !== uniqueIds.length) {
        throw new Error('Tour category not found');
      }

      let count = await models.Tours.countDocuments({
        $or: [
          { categories: { $in: uniqueIds } },
          { categoryIds: { $in: uniqueIds } },
          { tagIds: { $in: uniqueIds } },
          { categoryId: { $in: uniqueIds } },
        ],
      });

      count += await models.BmsTourCategories.countDocuments({
        parentId: { $in: uniqueIds },
        _id: { $nin: uniqueIds },
      });

      if (count > 0) {
        throw new Error("Can't remove a category");
      }

      return models.BmsTourCategories.deleteMany({ _id: { $in: uniqueIds } });
    }

    public static async generateOrder(parentCategory, doc) {
      if (!doc?.code) {
        return '';
      }

      return parentCategory?.order
        ? `${parentCategory.order}${doc.code}/`
        : `${doc.code}/`;
    }
  }

  tourCategorySchema.loadClass(TourCategory);

  return tourCategorySchema;
};
