import { commonCompaignSchema, validCompaign } from './CompaignUtils';
import { COMPAIGN_STATUS } from './Constants';

export const assignmentCompaignSchema = {
  ...commonCompaignSchema,

  automationId: { type: String },
  // voucherCompaignId: { type: String }
};

export class AssignmentCompaign {
  public static async getAssignmentCompaign(models, _id: string) {
    const assignmentCompaign = await models.AssignmentCompaigns.findOne({ _id });

    if (!assignmentCompaign) {
      throw new Error('not found assignment compaign');
    }

    return assignmentCompaign;
  }

  public static async validAssignmentCompaign(doc) {
    validCompaign(doc);
  }

  public static async createAssignmentCompaign(models, doc) {
    try {
      await this.validAssignmentCompaign(doc);
    } catch (e) {
      throw new Error(e.message);
    }

    doc = {
      ...doc,
      createdAt: new Date(),
      modifiedAt: new Date(),
    }

    // await dataSources.AutomationAPI.createAutomation({
    //   name: doc.title,
    //   status: 'scheduled',
    //   triggers: [],
    //   actions: [],
    //   createdBy: 'loyaltySystem', updatedBy: 'loyaltySystem'
    // })

    return models.AssignmentCompaigns.create(doc);
  }

  public static async updateAssignmentCompaign(models, _id, doc) {
    try {
      await this.validAssignmentCompaign(doc);
    } catch (e) {
      throw new Error(e.message);
    }

    doc = {
      ...doc,
      modifiedAt: new Date(),
    }

    // await dataSources.AutomationsAPI.updateAutomation({
    //   _id,
    //   name: doc.title,
    //   status: 'scheduled',
    //   triggers: [],
    //   actions: [],
    //   updatedBy: 'loyaltySystem'
    // });

    return models.AssignmentCompaigns.updateOne({ _id }, { $set: doc });
  }

  public static async removeAssignmentCompaigns(models, ids: [String]) {
    const atAssignmentIds = await models.Assignments.find({
      assignmentCompaignId: { $in: ids }
    }).distinct('assignmentCompaignId');

    const usedCompaignIds = [...atAssignmentIds];
    const deleteCompaignIds = ids.map(id => !usedCompaignIds.includes(id));
    const now = new Date();

    await models.AssignmentCompaigns.updateMany(
      { _id: { $in: usedCompaignIds } },
      { $set: { status: COMPAIGN_STATUS.TRASH, modifiedAt: now } }
    );

    // await dataSources.AutomationsAPI.removeAutomations(
    //   automationIds
    // );

    return models.AssignmentCompaigns.deleteMany({ _id: { $in: deleteCompaignIds } });
  }
}
