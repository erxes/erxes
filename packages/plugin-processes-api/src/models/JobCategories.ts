import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { JOB_STATUSES } from './definitions/constants';
import {
  IJobCategory,
  IJobCategoryDocument,
  jobCategorySchema
} from './definitions/jobCategories';

export interface IJobCategoryModel extends Model<IJobCategoryDocument> {
  getJobCategory(_id: string): Promise<IJobCategoryDocument>;
  createJobCategory(doc: IJobCategory): Promise<IJobCategoryDocument>;
  updateJobCategory(
    _id: string,
    doc: IJobCategory
  ): Promise<IJobCategoryDocument>;
  removeJobCategory(_id: string): void;
}

export const loadJobCategoryClass = (models: IModels) => {
  class JobCategory {
    /*
     * Get a job
     */
    public static async getJobCategory(_id: string) {
      const job = await models.JobCategories.findOne({ _id });

      if (!job) {
        throw new Error('JobCategory not found');
      }

      return job;
    }

    static async checkCodeDuplication(code: string) {
      if (code.includes('/')) {
        throw new Error('The "/" character is not allowed in the code');
      }

      const category = await models.JobCategories.findOne({
        code
      });

      if (category) {
        throw new Error('Code must be unique');
      }
    }

    /**
     * Create a job
     */
    public static async createJobCategory(doc: IJobCategory) {
      await this.checkCodeDuplication(doc.code);

      const parentCategory = await models.JobCategories.findOne({
        _id: doc.parentId
      }).lean();

      // Generatingg order
      doc.order = await this.generateOrder(parentCategory, doc);

      const job = await models.JobCategories.create({
        ...doc,
        createdAt: new Date()
      });

      return job;
    }

    /**
     * Update JobCategory
     */
    public static async updateJobCategory(_id: string, doc: IJobCategory) {
      const category = await models.JobCategories.getJobCategory(_id);

      if (category.code !== doc.code) {
        await this.checkCodeDuplication(doc.code);
      }

      const parentCategory = await models.JobCategories.findOne({
        _id: doc.parentId
      }).lean();

      if (parentCategory && parentCategory.parentId === _id) {
        throw new Error('Cannot change category');
      }

      // Generatingg  order
      doc.order = await this.generateOrder(parentCategory, doc);

      const jobCategory = await models.JobCategories.getJobCategory(_id);

      const childCategories = await models.JobCategories.find({
        $and: [
          { order: { $regex: new RegExp(jobCategory.order, 'i') } },
          { _id: { $ne: _id } }
        ]
      });

      await models.JobCategories.updateOne({ _id }, { $set: doc });

      // updating child categories order
      childCategories.forEach(async childCategory => {
        let order = childCategory.order;

        order = order.replace(jobCategory.order, doc.order);

        await models.JobCategories.updateOne(
          { _id: childCategory._id },
          { $set: { order } }
        );
      });

      return models.JobCategories.findOne({ _id });
    }

    /**
     * Remove JobCategory
     */
    public static async removeJobCategory(_id: string) {
      await models.JobCategories.getJobCategory(_id);
      let count = await models.JobRefers.countDocuments({
        categoryId: _id,
        status: { $ne: JOB_STATUSES.ARCHIVED }
      });
      count += await models.JobCategories.countDocuments({ parentId: _id });

      if (count > 0) {
        throw new Error("Can't remove a job category");
      }
      return models.JobCategories.deleteOne({ _id });
    }

    /**
     * Generating order
     */
    public static async generateOrder(
      parentCategory: IJobCategory,
      doc: IJobCategory
    ) {
      const order = parentCategory
        ? `${parentCategory.order}/${doc.code}`
        : `${doc.code}`;

      return order;
    }
  }

  jobCategorySchema.loadClass(JobCategory);

  return jobCategorySchema;
};
