import { FilterQuery, Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  IPricingOption,
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
  getTourCategory(
    selector: FilterQuery<ITourCategoryDocument>,
  ): Promise<ITourCategoryDocument>;
  createTourCategory(doc: ITourCategory): Promise<ITourCategoryDocument>;
  updateTourCategory(
    _id: string,
    doc: ITourCategory,
  ): Promise<ITourCategoryDocument>;
  removeTourCategory(
    ids: string[],
  ): Promise<{ acknowledged?: boolean; deletedCount?: number }>;
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
    public static async createTour(doc) {
      const dateType = doc.dateType || 'fixed';

      if (dateType === 'fixed') {
        if (!doc.startDate) {
          throw new Error('Start date is required for fixed schedule tours');
        }
      } else if (dateType === 'flexible') {
        if (!doc.availableFrom || !doc.availableTo) {
          throw new Error(
            'Available date range (from and to) is required for flexible schedule tours',
          );
        }
        if (new Date(doc.availableFrom) >= new Date(doc.availableTo)) {
          throw new Error('Available "from" date must be before "to" date');
        }
      }

      if (doc.pricingOptions) {
        if (doc.pricingOptions.length > 0) {
          this.validatePricingOptions(doc.pricingOptions);

          const prices = doc.pricingOptions
            .map((opt) => opt.pricePerPerson)
            .filter((p) => typeof p === 'number');

          doc.startingPrice = prices.length ? Math.min(...prices) : undefined;
        } else {
          doc.startingPrice = undefined;
        }
      }

      const element = await models.Tours.create({
        ...doc,
        dateType,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });
      return element;
    }

    /**
     * Update tour
     */
    public static async updateTour(_id, doc) {
      if (doc.dateType) {
        if (doc.dateType === 'fixed') {
          if (doc.startDate === undefined) {
            const existingTour = await models.Tours.findOne({ _id });
            if (!existingTour?.startDate) {
              throw new Error(
                'Start date is required for fixed schedule tours',
              );
            }
          }
        } else if (doc.dateType === 'flexible') {
          const existingTour = await models.Tours.findOne({ _id });
          const finalAvailableFrom =
            doc.availableFrom ?? existingTour?.availableFrom;
          const finalAvailableTo = doc.availableTo ?? existingTour?.availableTo;

          if (!finalAvailableFrom || !finalAvailableTo) {
            throw new Error(
              'Available date range (from and to) is required for flexible schedule tours',
            );
          }
          if (new Date(finalAvailableFrom) >= new Date(finalAvailableTo)) {
            throw new Error('Available "from" date must be before "to" date');
          }
        }
      }

      if (doc.pricingOptions) {
        if (doc.pricingOptions.length > 0) {
          this.validatePricingOptions(doc.pricingOptions);

          const prices = doc.pricingOptions
            .map((opt) => opt.pricePerPerson)
            .filter((p) => typeof p === 'number');

          doc.startingPrice = prices.length ? Math.min(...prices) : undefined;
        } else {
          doc.startingPrice = undefined;
        }
      }

      await models.Tours.updateOne(
        { _id },
        { $set: { ...doc, modifiedAt: new Date() } },
      );

      return await models.Tours.findOne({ _id });
    }

    /**
     * Validate pricing options
     */
    private static validatePricingOptions(
      pricingOptions: IPricingOption[],
    ): void {
      const combinations = new Set<string>();

      for (const option of pricingOptions) {
        // 1. minPersons validation
        if (typeof option.minPersons !== 'number' || option.minPersons < 1) {
          throw new Error(
            `Invalid pricing option "${option.title}": minPersons must be >= 1`,
          );
        }

        // 2. maxPersons validation
        if (
          option.maxPersons !== undefined &&
          option.maxPersons !== null &&
          option.maxPersons < option.minPersons
        ) {
          throw new Error(
            `Invalid pricing option "${option.title}": maxPersons (${option.maxPersons}) must be >= minPersons (${option.minPersons})`,
          );
        }

        // 3. price validation
        if (
          option.pricePerPerson === undefined ||
          option.pricePerPerson === null ||
          option.pricePerPerson <= 0
        ) {
          throw new Error(
            `Invalid pricing option "${option.title}": pricePerPerson must be > 0`,
          );
        }

        // 4. normalize accommodationType (optional safety)
        const accommodationType = option.accommodationType
          ? option.accommodationType.trim().toLowerCase()
          : '';

        // 5. duplicate check – normalize for comparison
        const key = `${option.minPersons}|${
          option.maxPersons ?? ''
        }|${accommodationType}|${option.pricePerPerson}`;

        if (combinations.has(key)) {
          throw new Error(
            `Duplicate pricing option found: minPersons=${option.minPersons}, maxPersons=${option.maxPersons}, accommodationType=${accommodationType}`,
          );
        }

        combinations.add(key);
      }
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
    public static async getTourCategory(
      selector: FilterQuery<ITourCategoryDocument>,
    ) {
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

      if (doc.parentId && !parentCategory) {
        throw new Error('Parent category not found');
      }

      doc.order = this.generateOrder(parentCategory, doc);

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

      if (parentIdToUse && !parentCategory) {
        throw new Error('Parent category not found');
      }

      if (parentIdToUse) {
        let currentCategory = parentCategory;
        const visited = new Set<string>();

        while (currentCategory) {
          const currentId = String(currentCategory._id);

          if (visited.has(currentId)) {
            throw new Error(
              'Circular reference detected in category hierarchy',
            );
          }

          if (currentId === _id) {
            throw new Error(
              'Cannot set parent: would create circular reference',
            );
          }

          visited.add(currentId);

          if (!currentCategory.parentId) {
            break;
          }

          currentCategory = await models.BmsTourCategories.findOne({
            _id: currentCategory.parentId,
          }).lean();
        }
      }
      const mergedDoc = {
        ...existingCategory.toObject(),
        ...doc,
      };
      const oldOrder = existingCategory.order;
      doc.order = this.generateOrder(parentCategory, mergedDoc);
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

    public static generateOrder(parentCategory, doc) {
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
