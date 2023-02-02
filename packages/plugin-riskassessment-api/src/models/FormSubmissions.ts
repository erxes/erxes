import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  sendCardsMessage,
  sendCoreMessage,
  sendFormsMessage
} from '../messageBroker';
import {
  calculateFormResponses,
  calculateResult,
  calculateRiskAssessment,
  checkAllUsersSubmitted,
  checkEveryUserSubmitted,
  getAsssignedUsers,
  getFieldsGroupByForm,
  getFormId
} from '../utils';
import { IRiskFormSubmissionParams } from './definitions/common';
import {
  IRiskFormSubmissionDocument,
  riskConformityFormSubmissionSchema
} from './definitions/confimity';

export interface IRiskFormSubmissionModel
  extends Model<IRiskFormSubmissionDocument> {
  formSaveSubmission(
    params: IRiskFormSubmissionParams
  ): Promise<IRiskFormSubmissionDocument>;
  formSubmitHistory(
    cardId: string,
    cardType: string,
    riskAssessmentId: string
  ): Promise<IRiskFormSubmissionDocument>;
}

const generateFields = params => {
  const filter: any = {};
  if (params.indicatorId) {
    filter.indicatorId = params.indicatorId;
  }
  if (params.userId) {
    filter.userId = params.userId;
  }
  if (params.cardId) {
    filter.cardId = params.cardId;
  }
  if (params.cardType) {
    filter.cardType = params.cardType;
  }
  if (params.riskAssessmentId) {
    filter.assessmentId = params.riskAssessmentId;
  }
  return filter;
};

export const loadRiskFormSubmissions = (models: IModels, subdomain: string) => {
  class FormSubmissionsClass {
    public static async formSaveSubmission(params: IRiskFormSubmissionParams) {
      const {
        riskAssessmentId,
        formSubmissions,
        cardId,
        cardType,
        indicatorId,
        customScore
      } = params;

      const riskAssessment = await models.RiskAssessments.findOne({
        _id: riskAssessmentId
      });

      if (!riskAssessment) {
        throw new Error('Somethin went wrong');
      }

      /**
       * Calculate the submitted indicator score of user
       */

      const { forms, customScoreField } = await models.RiskIndicators.findOne({
        _id: indicatorId
      }).lean();
      let totalCount = 0;
      let totalPercent = 0;
      let resultSumNumber = 0;

      if (customScoreField) {
        const percentWeight = customScoreField.percentWeight;
        totalCount = (customScore || 0) * (percentWeight / 100);
        totalPercent += customScoreField.percentWeight / 100;
      }

      const filter = generateFields(params);

      await models.RiksFormSubmissions.create({
        ...filter,
        value: customScore,
        contentType: 'customScore'
      });

      for (const form of forms) {
        const fields = await sendFormsMessage({
          subdomain,
          action: 'fields.find',
          data: {
            query: { contentType: 'form', contentTypeId: form.formId }
          },
          isRPC: true,
          defaultValue: []
        });

        if (forms.length === 1) {
          const { sumNumber, submissions } = await calculateFormResponses({
            responses: formSubmissions,
            fields,
            calculateMethod: form.calculateMethod,
            filter: { ...filter, riskAssessmentId: riskAssessmentId }
          });

          await models.RiskAssessmentIndicators.updateOne(
            { assessmentId: riskAssessmentId, indicatorId },
            { $inc: { totalScore: sumNumber } }
          );

          resultSumNumber = sumNumber;

          await models.RiksFormSubmissions.insertMany(submissions);
        }

        if (forms.length > 1) {
          const fieldIds = fields.map(field => field._id);
          const responses: any = {};

          for (const [key, value] of Object.entries(formSubmissions)) {
            if (fieldIds.includes(key)) {
              responses[key] = value;
            }
          }
          const { sumNumber, submissions } = await calculateFormResponses({
            responses: responses,
            fields,
            calculateMethod: form.calculateMethod,
            filter: { ...filter, riskAssessmentId: riskAssessmentId }
          });
          totalCount += sumNumber * (form.percentWeight / 100);
          totalPercent += form.percentWeight / 100;
          await models.RiksFormSubmissions.insertMany(submissions);
        }
      }
      if (forms.length > 1) {
        totalCount = totalCount / totalPercent;
        resultSumNumber = totalCount;
        await models.RiskAssessmentIndicators.updateOne(
          { assessmentId: riskAssessmentId, indicatorId },
          { $inc: { totalScore: totalCount } }
        );
      }

      /**
       * calculate the risk assessment indicator if all assigned members submitted
       */

      if (
        await this.checkRiskAssessmentIndicator({
          cardId,
          cardType,
          assessmentId: riskAssessmentId,
          indicatorId: indicatorId
        })
      ) {
        await this.calculateRiskIndicator({
          assessmentId: riskAssessmentId,
          indicatorId,
          cardId,
          cardType
        });
      }

      /**
       * Calculate the risk assessment if all risk assessment indicators are calculated
       */

      if (
        await this.checkRiskAssessment({
          riskAssessmentId: riskAssessmentId
        })
      ) {
        await this.calculateAssessment({ riskAssessmentId });
      }

      const assessmentIndicator = await models.RiskAssessmentIndicators.findOne(
        { assessmentId: riskAssessmentId, indicatorId }
      );

      return {
        sumNumber: resultSumNumber,
        resultScore: assessmentIndicator?.resultScore || 0,
        cardId,
        cardType,
        riskAssessmentId
      };
    }
    static async checkRiskAssessment({ riskAssessmentId }) {
      const riskAssessment = await models.RiskAssessments.findOne({
        _id: riskAssessmentId
      });
      if (!riskAssessment) {
        return;
      }
      let indicatorIds: any[] = [];

      if (!!riskAssessment.groupId) {
        const indicatorsGroups = await models.IndicatorsGroups.find({
          _id: riskAssessment.groupId
        });

        for (const { groups } of indicatorsGroups) {
          for (const group of groups) {
            indicatorIds = [...indicatorIds, ...group.indicatorIds];
          }
        }
      }
      const count = await models.RiskAssessmentIndicators.countDocuments({
        assessmentId: riskAssessment._id,
        indicatorId: { $in: indicatorIds },
        status: 'In Progress'
      });
      return count === 0;
    }
    static async checkRiskAssessmentIndicator({
      cardId,
      cardType,
      assessmentId,
      indicatorId
    }) {
      const assignedUserIds = (
        await getAsssignedUsers(subdomain, cardId, cardType)
      ).map(user => user._id);

      const submissions = await models.RiksFormSubmissions.find({
        cardId,
        assessmentId,
        indicatorId,
        userId: { $in: assignedUserIds }
      });

      let submittedUsers: any = {};

      for (const submission of submissions) {
        submittedUsers[submission.userId] = submission;
      }
      return Object.keys(submittedUsers).length === assignedUserIds.length;
    }

    static async calculateRiskIndicator({
      assessmentId,
      indicatorId,
      cardId,
      cardType
    }) {
      const indicator = await models.RiskIndicators.findOne({
        _id: indicatorId
      });
      if (!indicator) {
        return;
      }
      let { calculateLogics, calculateMethod, forms } = indicator;

      if (forms?.length === 1) {
        calculateLogics = forms[0].calculateLogics;
      }

      const assignedUserIds = (
        await getAsssignedUsers(subdomain, cardId, cardType)
      ).map(user => user._id);

      const riskAssessmentIndicator = await models.RiskAssessmentIndicators.findOne(
        { assessmentId, indicatorId }
      );

      let resultScore = 0;

      if (calculateMethod === 'Average') {
        resultScore =
          (riskAssessmentIndicator?.totalScore || 0) /
          (assignedUserIds.length || 1);
      } else {
        resultScore = riskAssessmentIndicator?.totalScore || 0;
      }

      await calculateResult({
        collection: models.RiskAssessmentIndicators,
        calculateLogics,
        resultScore,
        filter: {
          assessmentId,
          indicatorId
        }
      });
    }

    static async calculateAssessment({ riskAssessmentId }) {
      const riskAssessment = await models.RiskAssessments.findOne({
        _id: riskAssessmentId
      });

      if (riskAssessment?.groupId) {
        const indicatorsGroup = await models.IndicatorsGroups.findOne({
          _id: riskAssessment?.groupId
        });

        if (!indicatorsGroup) {
          throw new Error('Invalid indicators group id');
        }

        const {
          _id,
          groups,
          calculateLogics,
          calculateMethod
        } = indicatorsGroup;

        const assignedUsersCount = (
          await getAsssignedUsers(
            subdomain,
            riskAssessment.cardId,
            riskAssessment.cardType
          )
        ).length;

        for (const group of groups) {
          const { indicatorIds, calculateLogics, calculateMethod } = group;
          const riskAssessmentIndicators = await models.RiskAssessmentIndicators.find(
            {
              assessmentId: riskAssessmentId,
              indicatorId: { $in: indicatorIds }
            }
          );

          let totalCount = calculateMethod === 'Multiply' ? 1 : 0;

          for (const riskAssessmentIndicator of riskAssessmentIndicators) {
            if (calculateMethod === 'Multiply') {
              totalCount *= riskAssessmentIndicator.totalScore;
            }
            if (calculateMethod === 'Addition') {
              totalCount += riskAssessmentIndicator.totalScore;
            }
          }

          if (calculateMethod === 'Avarage') {
            totalCount = totalCount / (indicatorIds.length || 1);
          }

          await calculateResult({
            collection: models.RiskAssessmentGroups,
            calculateLogics,
            resultScore: totalCount,
            filter: {
              assessmentId: riskAssessmentId,
              groupId: group._id
            }
          });
        }

        const groupIds = groups.map(group => group._id);

        const assessmentGroups = await models.RiskAssessmentGroups.find({
          assessmentId: riskAssessmentId,
          groupId: { $in: groupIds }
        });

        let totalCount = calculateMethod === 'Multiply' ? 1 : 0;
        for (const assessmentGroup of assessmentGroups) {
          const percentWeight =
            (groups.find(group => group._id === assessmentGroup.groupId) || {})
              ?.percentWeight || 100;

          if (calculateMethod === 'Multiply') {
            totalCount *= assessmentGroup.resultScore * (percentWeight / 100);
          }
          if (calculateMethod === 'Addition') {
            totalCount += assessmentGroup.resultScore * (percentWeight / 100);
          }
        }
        if (calculateMethod === 'Avarege') {
          totalCount = totalCount / (assignedUsersCount || 1);
        }

        const groupResult = await calculateResult({
          collection: models.RiskAssessmentGroups,
          calculateLogics,
          resultScore: totalCount,
          filter: { groupId: _id, assessmentId: riskAssessmentId }
        });

        await models.RiskAssessments.findByIdAndUpdate(riskAssessmentId, {
          $set: {
            totalScore: totalCount,
            resultScore: totalCount / (assignedUsersCount || 1),
            status: groupResult.status,
            statusColor: groupResult.statusColor,
            closedAt: Date.now()
          }
        });
      } else {
        const riskAssessment = await models.RiskAssessments.findOne({
          _id: riskAssessmentId
        });
        if (!riskAssessment) {
          return;
        }
        const { indicatorId } = riskAssessment;
        const riskAssessmentIndicator = await models.RiskAssessmentIndicators.findOne(
          { assessmentId: riskAssessmentId, indicatorId: indicatorId }
        );

        await models.RiskAssessments.updateOne(
          { _id: riskAssessmentId },
          {
            resultScore: riskAssessmentIndicator?.resultScore,
            totalScore: riskAssessmentIndicator?.totalScore,
            status: riskAssessmentIndicator?.status,
            statusColor: riskAssessmentIndicator?.statusColor,
            closedAt: Date.now()
          }
        );
      }
    }
  }

  riskConformityFormSubmissionSchema.loadClass(FormSubmissionsClass);
  return riskConformityFormSubmissionSchema;
};
