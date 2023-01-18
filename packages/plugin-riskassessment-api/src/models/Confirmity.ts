import { paginate } from '@erxes/api-utils/src';
import { Model } from 'mongoose';
import { IModels, models } from '../connectionResolver';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendFormsMessage
} from '../messageBroker';
import { calculateRiskAssessment } from '../utils';
import {
  IRiskConformityField,
  IRiskConformityParams
} from './definitions/common';
import {
  IRiskConformityDocument,
  riskConformitySchema
} from './definitions/confimity';

export interface IRiskConformityModel extends Model<IRiskConformityDocument> {
  riskConformity(
    params: IRiskConformityParams
  ): Promise<IRiskConformityDocument>;
  riskConformities(
    params: IRiskConformityParams
  ): Promise<IRiskConformityDocument>;
  riskConformitiesTotalCount(params: IRiskConformityParams): Number;
  riskConformitySubmissions(params: {
    cardId: string;
  }): Promise<IRiskConformityDocument>;
  riskConformityDetail(
    params: IRiskConformityParams
  ): Promise<IRiskConformityDocument>;
  riskConformityAdd(
    params: IRiskConformityField
  ): Promise<IRiskConformityDocument>;
  riskConformityUpdate(
    params: IRiskConformityField
  ): Promise<IRiskConformityDocument>;
  riskConformityRemove(cardId: string): Promise<IRiskConformityDocument>;
  riskConformityFormDetail(params): any;
}

const statusColors = {
  Unacceptable: '#393c40',
  Error: '#ea475d',
  Warning: '#f7ce53',
  Danger: '#ff6600',
  Success: '#3ccc38',
  In_Progress: '#3B85F4',
  No_Result: '#888'
};

const convertDateParams = date =>
  parseInt(date) ? new Date(parseInt(date)).toString() : new Date(date);

const generateFilter = params => {
  let filter: any = {};

  if (params.cardId) {
    filter.cardId = params.cardId;
  }

  if (params.riskAssessmentId) {
    filter.riskAssessmentId = params.riskAssessmentId;
  }
  if (params.sortFromDate) {
    filter.createdAt = { $gte: convertDateParams(params.sortFromDate) };
  }

  if (params.sortToDate) {
    filter.createdAt = {
      ...filter.createdAt,
      $lte: convertDateParams(params.sortToDate)
    };
  }

  if (params.status) {
    filter.statusColor = statusColors[params.status];
  }

  if (params.closedFrom) {
    filter.closedAt = { $gte: convertDateParams(params.closedFrom) };
  }

  if (params.closedTo) {
    filter.closedAt = {
      ...filter.closedAt,
      $lte: convertDateParams(params.closedTo)
    };
  }

  if (params.createdFrom) {
    filter.createdAt = { $gte: convertDateParams(params.createdFrom) };
  }

  if (params.createdTo) {
    filter.createdAt = {
      ...filter.createdAt,
      $lte: convertDateParams(params.createdTo)
    };
  }

  if (params.cardType) {
    filter.cardType = params.cardType;
  }

  return filter;
};

export const loadRiskConformity = (models: IModels, subdomain: string) => {
  class RiskConformity {
    public static async riskConformityAdd(params: IRiskConformityField) {
      const { cardId, cardType } = params;
      const riskAssessment = await models.RiskAssessments.addRiskAssessment(
        params
      );

      const conformity = await models.RiskConformity.create({
        cardId,
        cardType,
        riskAssessmentId: riskAssessment?._id
      });
      return conformity;
    }
    public static async riskConformity(params: IRiskConformityParams) {
      const filter = generateFilter(params);
      const conformity = await models.RiskConformity.findOne(filter);
      const riskAssessment = await models.RiskAssessments.findOne({
        _id: conformity?.riskAssessmentId
      });

      return {
        _id: conformity?._id,
        cardId: conformity?.cardId,
        cardType: conformity?.cardType,
        riskAssessmentId: conformity?.riskAssessmentId,
        riskIndicatorIds: riskAssessment?.indicatorIds
      };
    }

    public static async riskConformities(params) {
      const filter = generateFilter(params);

      const sort = params?.sortField
        ? { [params.sortField]: params.sortDirection }
        : { createdAt: -1 };

      return await models.RiskConformity.find(filter).sort(sort);
    }

    public static async riskConformitiesTotalCount(params) {
      const filter = generateFilter(params);

      return await models.RiskConformity.find(filter).countDocuments();
    }

    public static async riskConformityDetail(params) {
      const { cardId } = params;

      let conformity = await models.RiskConformity.findOne({ cardId }).sort({
        createdAt: 1
      });

      console.log({ conformity });

      const riskAssessment = await models.RiskAssessments.findOne({
        _id: conformity?.riskAssessmentId
      });

      console.log(riskAssessment);

      return {
        _id: conformity?._id,
        cardId: conformity?.cardId,
        cardType: conformity?.cardType,
        riskAssessmentId: conformity?.riskAssessmentId,
        riskIndicatorIds: riskAssessment?.indicatorIds
      };
    }

    public static async riskConformityUpdate(params: IRiskConformityParams) {
      const { cardId, riskIndicatorIds, cardType } = params;

      if (!riskIndicatorIds && !riskIndicatorIds?.length) {
        throw new Error('riskIndicatorId is required');
      }
      if (!cardId) {
        throw new Error('cardId is required');
      }

      const confimity = await models.RiskConformity.findOne({
        cardId,
        cardType
      }).lean();

      if (!confimity) {
        throw new Error('Confimity not found');
      }

      const riskAssessment = await models.RiskAssessments.findOne({
        _id: confimity.riskAssessmentId
      });

      await models.RiskAssessmentIndicatorForms.find({
        assessmentId: riskAssessment?._id,
        indicatorId: { $nin: riskIndicatorIds }
      });

      await models.RiskAssessmentIndicators.deleteMany({
        assessmentId: riskAssessment?._id,
        indicatorId: { $nin: riskIndicatorIds }
      });

      return await models.RiskConformity.findOneAndUpdate(
        { _id: confimity._id },
        { ...confimity, riskIndicatorIds },
        { new: true }
      );
    }

    public static async riskConformityRemove(cardId: string) {
      if (!cardId) {
        throw new Error('cardId is required');
      }

      await models.RiskConformity.deleteOne({ cardId });
      return 'success';
    }

    public static async riskConformitySubmissions(params) {
      const { cardId, cardType } = params;

      if (!cardId) {
        throw new Error('card Id is required');
      }

      if (
        !(await models.RiskConformity.findOne({ cardId: cardId, cardType }))
      ) {
        throw new Error('Not found selected risk assessment in card');
      }

      const {
        riskAssessmentId,
        status,
        formIds
      } = await models.RiskConformity.findOne({
        cardId: cardId,
        cardType
      }).lean();

      const assignedUsers = await this.getAsssignedUsers(cardId, cardType);

      for (const usr of assignedUsers) {
        const submissions = await models.RiksFormSubmissions.find({
          cardId: cardId,
          formId: { $in: formIds },
          userId: usr._id,
          riskAssessmentId
        });
        if (submissions.length > 0) {
          usr['isSubmittedRiskAssessmentForm'] = true;
        }
      }

      if (status !== 'In Progress') {
        const assignedUserIds = assignedUsers.map(user => user._id);
        const submittedUsers = await models.RiksFormSubmissions.find({
          userId: { $in: assignedUserIds },
          riskAssessmentId,
          cardId: cardId,
          formId: { $in: formIds }
        });
        const submittedUsersIds = [
          ...new Set(submittedUsers.map(user => user.userId))
        ];
        return assignedUsers.filter(user =>
          submittedUsersIds.some(submission => submission === user._id)
        );
      }

      return assignedUsers;
    }

    public static async riskConformityFormDetail(params) {
      const { cardId, userId, riskIndicatorId } = params;

      if (!cardId) {
        throw new Error('Card ID is required');
      }
      const { categoryId, forms } = await models.RiskIndicators.findOne({
        _id: riskIndicatorId
      }).lean();

      const formIds = forms.map(form => form.formId);
      // if (!formId) {
      //   throw new Error('Form ID is required');
      // }

      const query = { contentType: 'form', contentTypeId: { $in: formIds } };
      const editedsubmissions = {};
      let submissionForms: any[] = [];

      const fields = await sendFormsMessage({
        subdomain,
        action: 'fields.find',
        data: { query },
        isRPC: true,
        defaultValue: []
      });

      for (const field of fields) {
        // editedFields[field.contentTypeId] = field;
        if (submissionForms.find(form => form.formId === field.contentTypeId)) {
          submissionForms = submissionForms.map(form =>
            form.formId === field.contentTypeId
              ? { ...form, fields: [...form.fields, field] }
              : form
          );
        } else {
          const { title } = await sendFormsMessage({
            subdomain,
            action: 'findOne',
            data: { _id: field.contentTypeId },
            isRPC: true,
            defaultValue: {}
          });

          submissionForms.push({
            formId: field.contentTypeId,
            formTitle: title || '',
            fields: [field]
          });
        }
      }
      const submissions = await models.RiksFormSubmissions.find({
        cardId,
        formId: { $in: formIds },
        userId
      }).lean();

      console.log({ submissions });

      for (const submission of submissions) {
        editedsubmissions[submission.fieldId] = submission.value;
      }

      return {
        forms: submissionForms,
        submissions: editedsubmissions,
        formId: ''
      };
    }

    static async getAsssignedUsers(cardId: string, cardType: string) {
      let assignedUsers;
      const card = await sendCardsMessage({
        subdomain,
        action: `${cardType}s.findOne`,
        data: {
          _id: cardId
        },
        isRPC: true,
        defaultValue: []
      });

      if (card) {
        const { assignedUserIds } = card;

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
      const { riskAssessmentId } = await models.RiskConformity.findOne({
        cardId
      }).lean();
      const { categoryId } = await models.RiskIndicators.findOne({
        _id: riskAssessmentId
      }).lean();

      const { formId } = await models.RiskAssessmentCategory.findOne({
        _id: categoryId
      }).lean();
      return formId;
    }
  }
  riskConformitySchema.loadClass(RiskConformity);
  return riskConformitySchema;
};
