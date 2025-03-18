import { validSearchText } from "@erxes/api-utils/src";
import { Model } from "mongoose";
import {
  activityCategorySchema,
  activitySchema,
  IActivity,
  IActivityCategory,
  IActivityCategoryDocument,
  IActivityDocument,
} from "./definitions/activities";

export interface IActivityModel extends Model<IActivityDocument> {
  createActivity(doc: IActivity, user: any): Promise<IActivityDocument>;
  getActivity(_id: string): Promise<IActivityDocument>;
  updateActivity(_id: string, doc: IActivity): Promise<IActivityDocument>;
  removeActivities(activityIds: string[]): Promise<IActivityDocument>;
}

export interface IActivityCategoryModel
  extends Model<IActivityCategoryDocument> {
  getActivityCategory(selector: any): Promise<IActivityCategoryDocument>;
  createActivityCategory(
    doc: IActivityCategory
  ): Promise<IActivityCategoryDocument>;
  updateActivityCategory(
    _id: string,
    doc: IActivityCategory
  ): Promise<IActivityCategoryDocument>;
  removeActivityCategory(_id: string): Promise<IActivityCategoryDocument>;
  generateOrder(
    parentCategory: any,
    doc: IActivityCategory
  ): Promise<IActivityCategoryDocument>;
}

export const loadActivityClass = (models) => {
  class Activity {
    static async checkCodeDuplication(code: string) {
      const activity = await models.Activities.findOne({
        code,
      });

      if (activity) {
        throw new Error("Code must be unique");
      }
    }
    public static fillSearchText(doc) {
      return validSearchText([
        doc.name || "",
        doc.description || "",
        doc.code || "",
      ]);
    }
    /**
     * Retreives activity
     */
    public static async getActivity(_id: string) {
      const activity = await models.Activities.findOne({ _id });

      if (!activity) {
        throw new Error("Activity not found");
      }

      return activity;
    }

    /**
     * Create a activity
     */
    public static async createActivity(doc, user) {
      doc.code = doc.code
        .replace(/\*/g, "")
        .replace(/_/g, "")
        .replace(/ /g, "");
      await this.checkCodeDuplication(doc.code);
      const activity = await models.Activities.create({
        ...doc,
        createdAt: new Date(),
        modifiedAt: new Date(),
        searchText: models.Activities.fillSearchText(doc),
      });

      return activity;
    }

    /**
     * Remove activity
     */
    public static async removeActivities(activityIds) {
      return models.Activities.deleteMany({ _id: { $in: activityIds } });
    }

    /**
     * Update activity
     */
    public static async updateActivity(_id, doc) {
      const searchText = models.Activities.fillSearchText(
        Object.assign(await models.Activities.getActivity(_id), doc)
      );
      await models.Activities.updateOne(
        { _id },
        { $set: { ...doc, searchText, modifiedAt: new Date() } }
      );

      return models.Activities.findOne({ _id });
    }
  }
  activitySchema.loadClass(Activity);

  return activitySchema;
};

export const loadActivityCategoryClass = (models) => {
  class ActivityCategory {
    /**
     *
     * Get Activity Cagegory
     */

    public static async getActivityCategory(selector: any) {
      const activityCategory =
        await models.ActivityCategories.findOne(selector);

      if (!activityCategory) {
        throw new Error("Activity category not found");
      }

      return activityCategory;
    }
    /**
     * Create a activity categorys
     */
    public static async createActivityCategory(doc) {
      const parentCategory = doc.parentId
        ? await models.ActivityCategories.findOne({
            _id: doc.parentId,
          }).lean()
        : undefined;

      // Generating order
      doc.order = await this.generateOrder(parentCategory, doc);

      return models.ActivityCategories.create(doc);
    }

    /**
     * Update Activity category
     */
    public static async updateActivityCategory(_id, doc) {
      const parentCategory = doc.parentId
        ? await models.ActivityCategories.findOne({
            _id: doc.parentId,
          }).lean()
        : undefined;

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error("Cannot change category");
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const activityCategory =
        await models.ActivityCategories.getActivityCategory({
          _id,
        });

      const childCategories = await models.ActivityCategories.find({
        $and: [
          { order: { $regex: new RegExp(activityCategory.order, "i") } },
          { _id: { $ne: _id } },
        ],
      });

      await models.ActivityCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async (category) => {
        let order = category.order;

        order = order.replace(activityCategory.order, doc.order);

        await models.ActivityCategories.updateOne(
          { _id: category._id },
          { $set: { order } }
        );
      });

      return models.ActivityCategories.findOne({ _id });
    }

    /**
     * Remove Activity category
     */
    public static async removeActivityCategory(_id) {
      await models.ActivityCategories.getActivityCategory({ _id });

      let count = await models.Activitys.countDocuments({ categoryId: _id });

      count += await models.ActivityCategories.countDocuments({
        parentId: _id,
      });

      if (count > 0) {
        throw new Error("Can't remove a activity category");
      }

      return models.ActivityCategories.deleteOne({ _id });
    }

    /**
     * Generating order
     */
    public static async generateOrder(parentCategory, doc) {
      const order = parentCategory
        ? `${parentCategory.order}/${doc.code}`
        : `${doc.code}`;

      return order;
    }
  }

  activityCategorySchema.loadClass(ActivityCategory);

  return activityCategorySchema;
};
