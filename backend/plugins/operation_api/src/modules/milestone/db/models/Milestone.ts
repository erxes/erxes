import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';

import { milestoneSchema } from '@/milestone/db/definitions/milestone';
import { IMilestone, IMilestoneDocument } from '@/milestone/types';
import { IUserDocument } from 'erxes-api-shared/core-types';

export interface IMilestoneModel extends Model<IMilestoneDocument> {
  getMilestone(_id: string): Promise<IMilestoneDocument>;
  createMilestone(
    doc: IMilestone,
    user: IUserDocument,
  ): Promise<IMilestoneDocument>;
  updateMilestone(
    _id: string,
    doc: IMilestone,
  ): Promise<IMilestoneDocument | null>;
  removeMilestone(
    _id: string,
    user: IUserDocument,
  ): Promise<IMilestoneDocument | null>;
}

export const loadMilestoneClass = (models: IModels) => {
  class Milestone {
    public static async getMilestone(_id: string): Promise<IMilestoneDocument> {
      const milestone = await models.Milestone.findOne({ _id });

      if (!milestone) {
        throw new Error('Milestone not found');
      }

      return milestone;
    }

    public static async createMilestone(
      doc: IMilestone,
      user: IUserDocument,
    ): Promise<IMilestoneDocument> {
      const milestone = await models.Milestone.create(doc);

      await models.Activity.createActivity({
        action: 'CREATED',
        contentId: doc.projectId,
        module: 'MILESTONE',
        metadata: {
          previousValue: undefined,
          newValue: milestone._id,
        },
        createdBy: user._id,
      });

      return milestone;
    }

    public static async updateMilestone(
      _id: string,
      doc: IMilestone,
    ): Promise<IMilestoneDocument | null> {
      const updatedMilestone = await models.Milestone.findOneAndUpdate(
        { _id },
        { $set: doc },
        { new: true },
      );

      return updatedMilestone;
    }

    public static async removeMilestone(
      _id: string,
      user: IUserDocument,
    ): Promise<IMilestoneDocument | null> {
      const milestone = await models.Milestone.getMilestone(_id);

      await models.Activity.createActivity({
        action: 'REMOVED',
        contentId: milestone.projectId,
        module: 'MILESTONE',
        metadata: {
          previousValue: milestone._id,
          newValue: undefined,
        },
        createdBy: user._id,
      });

      await models.Task.updateMany(
        { milestoneId: _id },
        { $set: { milestoneId: null } },
      );

      return await models.Milestone.findOneAndDelete({
        _id,
      });
    }
  }

  milestoneSchema.loadClass(Milestone);

  return milestoneSchema;
};
