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
      console.log({ filter, conformity });
      const riskAssessment = await models.RiskAssessments.findOne({
        _id: conformity?.riskAssessmentId
      });

      return {
        _id: conformity?._id,
        cardId: conformity?.cardId,
        cardType: conformity?.cardType,
        riskAssessmentId: riskAssessment?._id
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

      let conformity = await models.RiskConformity.findOne({ cardId });
      if (!conformity) {
        return;
      }

      const riskAssessment = await models.RiskAssessments.findOne({
        _id: conformity?.riskAssessmentId
      }).lean();

      if (!riskAssessment) return;

      const {
        indicatorIds,
        groupIds,
        operationIds,
        branchIds,
        departmentIds
      } = riskAssessment;

      return {
        _id: conformity?._id,
        cardId: conformity?.cardId,
        cardType: conformity?.cardType,
        riskAssessmentId: conformity?.riskAssessmentId,
        riskIndicatorIds: indicatorIds,
        groupIds,
        operationIds,
        branchIds,
        departmentIds
      };
    }

    public static async riskConformityUpdate(params: IRiskConformityParams) {
      const { cardId, groupId, cardType, indicatorId, ...doc } = params;

      if (!params.indicatorId?.length && !params.groupId) {
        throw new Error('GroupId or IndicatorId must  be specified');
      }
      const conformity = await models.RiskConformity.findOne({
        cardId,
        cardType
      }).lean();

      if (!conformity) {
        throw new Error('Confimity not found');
      }

      const riskAssessment = await models.RiskAssessments.findOne({
        _id: conformity.riskAssessmentId
      });
      if (indicatorId) {
        await models.RiskAssessmentIndicators.deleteMany({
          assessmentId: conformity.riskAssessmentId
        });
      }

      let indicatorIds: any[] = [];

      if (params.groupId) {
        const indicatorsGroups = await models.IndicatorsGroups.find({
          _id: params.groupId
        });

        let groupIndicatorIds: string[] = [];

        for (const { groups } of indicatorsGroups) {
          for (const group of groups) {
            groupIndicatorIds = [...groupIndicatorIds, ...group?.indicatorIds];
          }
        }
        indicatorIds = groupIndicatorIds;
      }

      await models.RiskAssessmentIndicators.deleteMany({
        assessmentId: riskAssessment?._id,
        indicatorId: { $nin: indicatorIds }
      });

      await models.RiskAssessments.updateOne(
        { _id: riskAssessment?._id },
        { indicatorId, groupId, ...doc }
      );

      return await models.RiskConformity.findOneAndUpdate(
        { _id: conformity._id },
        { ...conformity },
        { new: true }
      );
    }

    public static async riskConformityRemove(cardId: string) {
      if (!cardId) {
        throw new Error('cardId is required');
      }

      return await models.RiskConformity.deleteOne({ cardId });
    }

    public static async riskConformitySubmissions(params) {
      const { cardId, cardType } = params;

      const conformity = await models.RiskConformity.findOne({
        cardId,
        cardType
      });

      if (!conformity) {
        throw new Error('Not found confirmity');
      }

      const { riskAssessmentId } = conformity;

      const riskAssessment = await models.RiskAssessments.findOne({
        _id: riskAssessmentId
      });

      const riskIndicatorIds = (
        await models.RiskAssessmentIndicators.find({
          assessmentId: riskAssessmentId
        })
      ).map(indicator => indicator.indicatorId);

      const formIds = (
        await models.RiskIndicators.find({ _id: { $in: riskIndicatorIds } })
      )
        .map(indicator => indicator.forms?.map(form => form.formId))
        .flat();

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

      if (riskAssessment?.status !== 'In Progress') {
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
      const { cardId, userId, riskAssessmentId } = params;
      const riskIndicatorIds = (
        await models.RiskAssessmentIndicators.find({
          assessmentId: riskAssessmentId
        })
      ).map(indicator => indicator.indicatorId);

      const indicatorId = params.indicatorId || riskIndicatorIds[0];
      const indicator = await models.RiskIndicators.findOne({
        _id: indicatorId
      });

      if (!indicator) {
        throw new Error('Something went wrong');
      }

      const formIds = indicator.forms?.map(form => form.formId);

      const query = { contentType: 'form', contentTypeId: { $in: formIds } };

      const fields = await sendFormsMessage({
        subdomain,
        action: 'fields.find',
        data: { query },
        isRPC: true,
        defaultValue: []
      });

      const editedsubmissions = {};

      const submissions = await models.RiksFormSubmissions.find({
        cardId,
        formId: { $in: formIds },
        userId
      }).lean();

      for (const submission of submissions) {
        editedsubmissions[submission.fieldId] = submission.value;
      }

      const indicators = await models.RiskIndicators.find({
        _id: { $in: riskIndicatorIds }
      });

      return {
        indicatorId: indicator._id,
        indicators,
        fields,
        submissions: editedsubmissions
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
