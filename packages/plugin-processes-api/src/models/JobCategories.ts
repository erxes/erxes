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

    /**
     * Create a job
     */
    public static async createJobCategory(doc: IJobCategory) {
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
      await models.JobCategories.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.JobCategories.getJobCategory(_id);

      return updated;
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
  }

  jobCategorySchema.loadClass(JobCategory);

  return jobCategorySchema;
};
