import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  IJobRefer,
  IJobReferDocument,
  jobReferSchema
} from './definitions/jobs';

export interface IJobReferModel extends Model<IJobReferDocument> {
  getJobRefer(_id: string): Promise<IJobReferDocument>;
  createJobRefer(doc: IJobRefer): Promise<IJobReferDocument>;
  updateJobRefer(_id: string, doc: IJobRefer): Promise<IJobReferDocument>;
  removeJobRefer(_id: string): void;
  removeJobRefers(jobRefersIds: string[]): void;
}

export const loadJobReferClass = (models: IModels) => {
  class JobRefer {
    /*
     * Get a job
     */
    public static async getJobRefer(_id: string) {
      const job = await models.JobRefers.findOne({ _id });

      if (!job) {
        throw new Error('JobRefer not found');
      }

      return job;
    }

    /**
     * Create a job
     */
    public static async createJobRefer(doc: IJobRefer) {
      const job = await models.JobRefers.create({
        ...doc,
        createdAt: new Date()
      });

      return job;
    }

    /**
     * Update JobRefer
     */
    public static async updateJobRefer(_id: string, doc: IJobRefer) {
      await models.JobRefers.updateOne({ _id }, { $set: { ...doc } });

      const updated = await models.JobRefers.getJobRefer(_id);

      return updated;
    }

    /**
     * Remove JobRefer
     */
    public static async removeJobRefer(_id: string) {
      await models.JobRefers.getJobRefer(_id);
      return models.JobRefers.deleteOne({ _id });
    }

    /**
     * Remove JobRefers
     */
    public static async removeJobRefers(jobRefersIds: string[]) {
      await models.JobRefers.deleteMany({ _id: { $in: jobRefersIds } });

      return 'deleted';
    }
  }

  jobReferSchema.loadClass(JobRefer);

  return jobReferSchema;
};
