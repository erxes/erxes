import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendCardsMessage, sendCoreMessage, sendFormsMessage } from '../messageBroker';
import { calculateRiskAssessment } from '../utils';
import { IRiskConfirmityField, IRiskConfirmityParams } from './definitions/common';
import { IRiskConfirmityDocument, riskConfirmitySchema } from './definitions/riskConfimity';

export interface IRiskConfirmityModel extends Model<IRiskConfirmityDocument> {
  riskConfirmities(params: IRiskConfirmityParams): Promise<IRiskConfirmityDocument>;
  riskConfirmitySubmissions(params: { dealId: string }): Promise<IRiskConfirmityDocument>;
  riskConfirmityDetails(params: IRiskConfirmityParams): Promise<IRiskConfirmityDocument>;
  riskConfirmityAdd(params: IRiskConfirmityField): Promise<IRiskConfirmityDocument>;
  riskConfirmityUpdate(params: IRiskConfirmityParams): Promise<IRiskConfirmityDocument>;
  riskConfirmityRemove(cardId: string): Promise<IRiskConfirmityDocument>;
  riskConfirmityFormDetail(params): any;
  riskAssessmentResult(params): any;
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

      const confirmities = await model.RiskConfimity.find(filter).lean();

      for (const confirmity of confirmities) {
        const riskAssesments = await model.RiskAssessment.findOne({
          _id: confirmity.riskAssessmentId
        });
        confirmity.name = riskAssesments?.name;
      }

      return confirmities;
    }
    public static async riskConfirmityDetails(params: IRiskConfirmityParams) {
      const filter = generateFilter(params);

      const confirmities = await model.RiskConfimity.find(filter).lean();

      const result: any = [];

      for (const confirmity of confirmities) {
        const riskAssesment = await model.RiskAssessment.findOne({
          _id: confirmity.riskAssessmentId
        });
        result.push(riskAssesment);
      }

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
        confimity._id,
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

      const assignedUsers = await this.getAsssignedUsers(dealId);
      const formId = await this.getFormId(dealId);

      for (const usr of assignedUsers) {
        const submissions = await sendFormsMessage({
          subdomain,
          action: 'submissions.find',
          data: {
            query: { contentType: 'form', contentTypeId: dealId, formId, userId: usr._id }
          },
          isRPC: true,
          defaultValue: []
        });
        if (submissions.length > 0) {
          usr['isSubmittedRiskAssessmentForm'] = true;
        }
      }
      return assignedUsers;
    }

    public static async riskConfirmityFormDetail(params) {
      const { cardId, userId } = params;

      if (!cardId) {
        throw new Error('Card ID is required');
      }
      const { riskAssessmentId } = await model.RiskConfimity.findOne({ cardId }).lean();
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

      const submissions = await sendFormsMessage({
        subdomain,
        action: 'submissions.find',
        data: {
          query: { contentType: 'form', contentTypeId: cardId, formId, userId }
        },
        isRPC: true,
        defaultValue: []
      });

      for (const submission of submissions) {
        editedsubmissions[submission.formFieldId] = submission.value;
      }

      return { fields, submissions: editedsubmissions, formId };
    }

    public static async riskAssessmentResult(params) {
      const { cardId } = params;
      if (await this.checkAllUsersSubmitted(cardId)) {
        calculateRiskAssessment(model, subdomain, cardId);
      }
      // if (Object.keys(groupedSubmissions).length === assignedUsers.length) {
      //   console.log('hell yeah');
      // }

      return ['dsa', 'dsadasdsadas'];
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

      const submissions = await sendFormsMessage({
        subdomain,
        action: 'submissions.find',
        data: {
          query: {
            contentType: 'form',
            contentTypeId: cardId,
            formId,
            userId: { $in: assignedUserIds }
          }
        },
        isRPC: true,
        defaultValue: []
      });
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
