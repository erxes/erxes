import { attachmentSchema } from './LoyaltyConfig';

export const assignmentCompaignSchema = {
  _id: { pkey: true },
  createdAt: { type: Date, label: 'Created at' },
  createdBy: { type: String, label: 'Created by' },
  modifiedAt: { type: Date, label: 'Modified at' },
  modifiedBy: { type: String, label: 'Modified by' },

  title: { type: String, label: 'Title' },
  description: { type: String, label: 'Description' },
  startDate: { type: Date, label: 'Start Date' },
  endDate: { type: Date, label: 'End Date' },
  attachment: { type: attachmentSchema },

  automationId: { type: String },
  voucherId: { type: String }
};

export class AssignmentCompaign {
  public static async getAssignment(models, _id: string) {
    const assignmentRule = await models.AssignmentCompaign.findOne({ _id });

    if (!assignmentRule) {
      throw new Error('not found assignment rule')
    }

    return assignmentRule;
  }
}
