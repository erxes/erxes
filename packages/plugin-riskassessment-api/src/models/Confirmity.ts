import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendCardsMessage, sendCoreMessage, sendFormsMessage } from '../messageBroker';
import { calculateRiskAssessment } from '../utils';
import { IRiskConfirmityField, IRiskConfirmityParams } from './definitions/common';
import { IRiskConfirmityDocument, riskConfirmitySchema } from './definitions/confimity';

export interface IRiskConfirmityModel extends Model<IRiskConfirmityDocument> {
  riskConfirmities(params: IRiskConfirmityParams): Promise<IRiskConfirmityDocument>;
  riskConfirmitySubmissions(params: { dealId: string }): Promise<IRiskConfirmityDocument>;
  riskConfirmityDetails(params: IRiskConfirmityParams): Promise<IRiskConfirmityDocument>;
  riskConfirmityAdd(params: IRiskConfirmityField): Promise<IRiskConfirmityDocument>;
  riskConfirmityUpdate(params: IRiskConfirmityParams): Promise<IRiskConfirmityDocument>;
  riskConfirmityRemove(cardId: string): Promise<IRiskConfirmityDocument>;
  riskConfirmityFormDetail(params): any;
}

const generateFilter = (params: IRiskConfirmityParams) => {
  let filter: any = {};

  if (params.cardId) {
    filter.cardId = params.cardId;
  }

  if (params.riskAssessmentId) {
    filter.riskAssessmentId = params.riskAssessmentId;
  }

  return filter;
};

export const loadRiskConfirmity = (model: IModels, subdomain: string) => {
  class RiskConfimity {
    public static async riskConfirmityAdd(params: IRiskConfirmityField) {
      return model.RiskConfimity.create({ ...params });
    }
    public static async riskConfirmities(params: IRiskConfirmityParams) {
      const filter = generateFilter(params);
      const confimities = await model.RiskConfimity.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'risk_assessments',
            localField: 'riskAssessmentId',
            foreignField: '_id',
            as: 'risk_assessment'
          }
        },
        { $unwind: '$risk_assessment' },
        {
          $addFields: {
            name: '$risk_assessment.name',
            statusColor: '$risk_assessment.statusColor'
          }
        },
        {
          $project: { risk_assessment: 0 }
        }
      ]);

      return confimities;
    }
    public static async riskConfirmityDetails(params: IRiskConfirmityParams) {
      const filter = generateFilter(params);

      const result = await model.RiskConfimity.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'risk_assessments',
            localField: 'riskAssessmentId',
            foreignField: '_id',
            as: 'risk_assessment'
          }
        },
        { $unwind: '$risk_assessment' },
        { $project: { _id: 0, createdAt: 0, cardId: 0, riskAssessmentId: 0, __v: 0 } },
        { $replaceWith: { $mergeObjects: ['$$ROOT', '$risk_assessment'] } },
        { $project: { risk_assessment: 0 } }
      ]);

      return result;
    }

    public static async riskConfirmityUpdate(params: IRiskConfirmityParams) {
      const { cardId, riskAssessmentId } = params;

      if (!riskAssessmentId) {
        throw new Error('riskAssessmentId is required');
      }
      if (!cardId) {
        throw new Error('cardId is required');
      }

      const confimity = await model.RiskConfimity.findOne({ cardId }).lean();

      if (!confimity) {
        throw new Error('Confimity not found');
      }

      return await model.RiskConfimity.findOneAndUpdate(
        { _id: confimity._id },
        { ...confimity, riskAssessmentId },
        { new: true }
      );
    }

    public static async riskConfirmityRemove(cardId: string) {
      if (!cardId) {
        throw new Error('cardId is required');
      }

      await model.RiskConfimity.deleteOne({ cardId });
      return 'success';
    }

    public static async riskConfirmitySubmissions(params) {
      const { dealId } = params;

      if (!dealId) {
        throw new Error('deal Id is required');
      }

      const { riskAssessmentId } = await model.RiskConfimity.findOne({ cardId: dealId }).lean();

      const assignedUsers = await this.getAsssignedUsers(dealId);
      const formId = await this.getFormId(dealId);

      for (const usr of assignedUsers) {
        const submissions = await model.RiksFormSubmissions.find({
          cardId: dealId,
          formId,
          userId: usr._id,
          riskAssessmentId
        });
        if (submissions.length > 0) {
          usr['isSubmittedRiskAssessmentForm'] = true;
        }
      }
      const { status } = await model.RiskAssessment.findOne({ _id: riskAssessmentId }).lean();

      if (status !== 'In Progress') {
        const assignedUserIds = assignedUsers.map(user => user._id);
        const submittedUsers = await model.RiksFormSubmissions.find({
          userId: { $in: assignedUserIds },
          riskAssessmentId,
          cardId: dealId,
          formId
        });
        const submittedUsersIds = [...new Set(submittedUsers.map(user => user.userId))];
        return assignedUsers.filter(user =>
          submittedUsersIds.some(submission => submission === user._id)
        );
      }

      return assignedUsers;
    }

    public static async riskConfirmityFormDetail(params) {
      const { cardId, userId, riskAssessmentId } = params;

      if (!cardId) {
        throw new Error('Card ID is required');
      }
      const { categoryId } = await model.RiskAssessment.findOne({ _id: riskAssessmentId }).lean();

      const { formId } = await model.RiskAssessmentCategory.findOne({ _id: categoryId }).lean();

      if (!formId) {
        throw new Error('Form ID is required');
      }

      const query = { contentType: 'form', contentTypeId: formId };
      const editedsubmissions = {};

      const fields = await sendFormsMessage({
        subdomain,
        action: 'fields.find',
        data: { query },
        isRPC: true,
        defaultValue: []
      });

      const submissions = await model.RiksFormSubmissions.find({
        cardId,
        formId,
        userId
      }).lean();

      for (const submission of submissions) {
        editedsubmissions[submission.fieldId] = submission.value;
      }

      return { fields, submissions: editedsubmissions, formId };
    }

    static async getAsssignedUsers(dealId: string) {
      let assignedUsers;
      const deal = await sendCardsMessage({
        subdomain,
        action: 'deals.findOne',
        data: {
          _id: dealId
        },
        isRPC: true,
        defaultValue: []
      });

      if (deal) {
        const { assignedUserIds } = deal;

        assignedUsers = await sendCoreMessage({
          subdomain,
          action: 'users.find',
          data: {
            query: { _id: { $in: assignedUserIds } }
          },
          isRPC: true,
          defaultValue: []
        });
      }

      return assignedUsers;
    }

    static async getFormId(cardId: string) {
      const { riskAssessmentId } = await model.RiskConfimity.findOne({ cardId }).lean();
      const { categoryId } = await model.RiskAssessment.findOne({ _id: riskAssessmentId }).lean();

      const { formId } = await model.RiskAssessmentCategory.findOne({ _id: categoryId }).lean();
      return formId;
    }

    static async checkAllUsersSubmitted(cardId: string) {
      let result = false;

      const assignedUsers = await this.getAsssignedUsers(cardId);

      const formId = await this.getFormId(cardId);

      const assignedUserIds = assignedUsers.map(usr => usr._id);
      const submissions = await model.RiksFormSubmissions.find({
        cardId,
        formId,
        userId: { $in: assignedUserIds }
      }).lean();

      const groupedSubmissions = {};

      for (const submission of submissions) {
        groupedSubmissions[submission.userId] = submission;
      }

      if (Object.keys(groupedSubmissions).length === assignedUsers.length) {
        result = true;
      }
      return result;
    }
  }
  riskConfirmitySchema.loadClass(RiskConfimity);
  return riskConfirmitySchema;
};
