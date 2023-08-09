import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendFormsMessage } from '../messageBroker';
import {
  calculateFormResponses,
  calculateResult,
  getAsssignedUsers,
  roundResult
} from '../utils';
import { IRiskFormSubmissionParams } from './definitions/common';
import {
  formSubmissionSchema,
  IRiskFormSubmissionDocument
} from './definitions/confimity';
import { IRiskAssessmentsDocument } from './definitions/riskassessment';

export interface IRiskFormSubmissionModel
  extends Model<IRiskFormSubmissionDocument> {
  formSaveSubmission(
    params: IRiskFormSubmissionParams
  ): Promise<IRiskFormSubmissionDocument>;
  testScore(params: IRiskFormSubmissionParams): Promise<any>;
  formSubmitHistory(
    cardId: string,
    cardType: string,
    riskAssessmentId: string
  ): Promise<IRiskFormSubmissionDocument>;
}

type CommonTypes = {
  cardId?: string;
  cardType?: string;
  assessmentId?: string;
  indicatorId?: string;
  userId?: string;
  groupId?: string;
};

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
    public static async testScore(params: IRiskFormSubmissionParams) {
      const { indicatorId, formSubmissions } = params;

      let resultScore: number = 0;
      let totalPercent: number = 0;
      let maxScoreAviable: any = 0;

      const { forms, calculateMethod } = await models.RiskIndicators.findOne({
        _id: indicatorId
      }).lean();

      const formIds = forms.map(form => form.formId);

      const fields = await sendFormsMessage({
        subdomain,
        action: 'fields.find',
        data: {
          query: { contentType: 'form', contentTypeId: { $in: formIds } }
        },
        isRPC: true,
        defaultValue: []
      });

      if (forms.length === 1) {
        const { sumNumber } = await calculateFormResponses({
          responses: formSubmissions,
          fields,
          calculateMethod: forms[0].calculateMethod,
          filter: {}
        });

        resultScore = sumNumber;
      }
      if (forms.length > 1) {
        for (const form of forms) {
          const fieldIds = fields
            .filter(field => field.contentTypeId === form.formId)
            .map(field => field._id);
          const responses: any = {};

          for (const [key, value] of Object.entries(formSubmissions)) {
            if (fieldIds.includes(key)) {
              responses[key] = value;
            }
          }
          const { sumNumber, scoreAviable } = await calculateFormResponses({
            responses: responses,
            fields,
            calculateMethod: form.calculateMethod,
            generalcalculateMethod: calculateMethod,
            filter: {}
          });

          resultScore += Number(
            (sumNumber * (form.percentWeight / 100)).toFixed(2)
          );
          totalPercent += form.percentWeight / 100;
          maxScoreAviable += Number(
            (scoreAviable * (form.percentWeight / 100)).toFixed(2)
          );
        }

        switch (calculateMethod) {
          case 'ByPercent':
            resultScore = Number(
              ((resultScore / maxScoreAviable) * (totalPercent * 100)).toFixed(
                1
              )
            );
            break;
          default:
            resultScore = resultScore / totalPercent;
        }
      }

      return { resultScore };
    }

    public static async formSaveSubmission(params: IRiskFormSubmissionParams) {
      const {
        branchId,
        departmentId,
        operationId,
        formSubmissions,
        cardId,
        cardType,
        indicatorId
      } = params;

      let commonFilter: any = { cardId, cardType };

      if (branchId) {
        commonFilter.branchId = branchId;
      }

      if (departmentId) {
        commonFilter.departmentId = departmentId;
      }

      if (operationId) {
        commonFilter.operationId = operationId;
      }

      const riskAssessment = await models.RiskAssessments.findOne(commonFilter);

      if (!riskAssessment) {
        throw new Error('Somethin went wrong');
      }

      const { _id, groupId } = riskAssessment;

      /**
       * Calculate the submitted indicator score of user
       */

      const { forms, calculateMethod } = await models.RiskIndicators.findOne({
        _id: indicatorId
      }).lean();
      let totalCount = 0;
      let totalPercent = 0;
      let resultSumNumber = 0;
      let maxScoreAviable: any = 0;

      const filter = generateFields(params);

      const formIds = forms.map(form => form.formId);

      const fields = await sendFormsMessage({
        subdomain,
        action: 'fields.find',
        data: {
          query: { contentType: 'form', contentTypeId: { $in: formIds } }
        },
        isRPC: true,
        defaultValue: []
      });

      if (forms.length === 1) {
        const { sumNumber, submissions } = await calculateFormResponses({
          responses: formSubmissions,
          fields,
          calculateMethod: forms[0].calculateMethod,
          filter: { ...filter, riskAssessmentId: _id }
        });

        await models.RiskAssessmentIndicators.updateOne(
          { assessmentId: _id, indicatorId },
          { $inc: { totalScore: sumNumber } }
        );

        resultSumNumber = sumNumber;

        await models.RiskFormSubmissions.insertMany(submissions);
      }
      if (forms.length > 1) {
        for (const form of forms) {
          const fieldIds = fields
            .filter(field => field.contentTypeId === form.formId)
            .map(field => field._id);
          const responses: any = {};

          for (const [key, value] of Object.entries(formSubmissions)) {
            if (fieldIds.includes(key)) {
              responses[key] = value;
            }
          }
          const {
            sumNumber,
            submissions,
            scoreAviable
          } = await calculateFormResponses({
            responses: responses,
            fields,
            calculateMethod: form.calculateMethod,
            generalcalculateMethod: calculateMethod,
            filter: { ...filter, riskAssessmentId: _id }
          });
          totalCount += Number(
            (sumNumber * (form.percentWeight / 100)).toFixed(2)
          );
          totalPercent += form.percentWeight / 100;
          maxScoreAviable += Number(
            (scoreAviable * (form.percentWeight / 100)).toFixed(2)
          );
          await models.RiskFormSubmissions.insertMany(submissions);
        }

        switch (calculateMethod) {
          case 'ByPercent':
            totalCount = Number(
              ((totalCount / maxScoreAviable) * (totalPercent * 100)).toFixed(1)
            );
            resultSumNumber = totalCount;
            break;
          default:
            totalCount = totalCount / totalPercent;
            resultSumNumber = totalCount;
        }
        await models.RiskAssessmentIndicators.updateOne(
          { assessmentId: _id, indicatorId },
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
          assessmentId: _id,
          indicatorId: indicatorId,
          userId: filter.userId
        })
      ) {
        await this.calculateRiskIndicator({
          assessmentId: _id,
          indicatorId,
          cardId,
          cardType
        });
      }

      /**
       * if selected some group in risk assessment check and calculate the risk assessment sub groups
       */

      if (groupId) {
        await this.checkAndCalculateRiskAssessmentGroup({
          assessmentId: _id,
          groupId: groupId
        });
      }

      /**
       * Calculate the risk assessment if all risk assessment indicators are calculated
       */

      if (
        await this.checkRiskAssessment({
          assessmentId: _id
        })
      ) {
        await this.calculateAssessment({ assessmentId: _id });
      }

      const assessmentIndicator = await models.RiskAssessmentIndicators.findOne(
        { assessmentId: _id, indicatorId }
      );

      return {
        sumNumber: resultSumNumber,
        resultScore: assessmentIndicator?.resultScore || 0,
        cardId,
        cardType,
        riskAssessmentId: _id
      };
    }

    static async checkRiskAssessment({ assessmentId }: CommonTypes) {
      const riskAssessment = await models.RiskAssessments.findOne({
        _id: assessmentId
      });
      if (!riskAssessment) {
        return 'Cannot find risk assessment';
      }

      const { _id, groupId } = riskAssessment;

      let indicatorIds: any[] = [];

      if (!!groupId) {
        const indicatorsGroups = await models.IndicatorsGroups.find({
          _id: groupId
        });

        for (const { groups } of indicatorsGroups) {
          for (const group of groups) {
            indicatorIds = [...indicatorIds, ...group.indicatorIds];
          }
        }
      }
      const count = await models.RiskAssessmentIndicators.countDocuments({
        assessmentId: _id,
        indicatorId: { $in: indicatorIds },
        status: 'In Progress'
      });
      return count === 0;
    }
    static async checkRiskAssessmentIndicator({
      cardId,
      cardType,
      assessmentId,
      indicatorId,
      userId
    }: CommonTypes) {
      let assignedUserIds = (
        await getAsssignedUsers(subdomain, cardId || '', cardType || '')
      ).map(user => user._id);

      if (!assignedUserIds?.length) {
        throw new Error('Something went wrong when fetch assigned users');
      }

      const riskAssessment = await models.RiskAssessments.findOne({
        _id: assessmentId
      });

      const { isSplittedUsers } = riskAssessment as IRiskAssessmentsDocument;

      if (isSplittedUsers) {
        const riskAssessmentGroups = await models.RiskAssessmentGroups.find({
          assessmentId: riskAssessment?._id,
          assignedUserIds: { $in: [userId] }
        });
        const groupAssignedUserIds = riskAssessmentGroups.reduce(
          (acc, item) => {
            return [
              ...(acc.assignedUserIds || []),
              ...(item.assignedUserIds || [])
            ];
          },
          {}
        );
        assignedUserIds = groupAssignedUserIds;
      }

      const submittedUsers = await models.RiskFormSubmissions.aggregate([
        {
          $match: {
            cardId,
            assessmentId,
            indicatorId,
            userId: { $in: assignedUserIds }
          }
        },
        {
          $group: {
            _id: '$userId',
            submission: { $push: '$$ROOT' }
          }
        }
      ]);

      return assignedUserIds.every(userId =>
        submittedUsers.some(submittedUser => submittedUser._id === userId)
      );
    }

    static async checkAndCalculateRiskAssessmentGroup({
      assessmentId,
      groupId
    }: CommonTypes) {
      const indicatorsGroup = await models.IndicatorsGroups.findOne({
        _id: groupId
      });

      if (!indicatorsGroup) {
        return 'Cannot find indicators group';
      }

      for (const group of indicatorsGroup?.groups || []) {
        const { indicatorIds, calculateLogics, calculateMethod } = group;

        const calculatedIndicators = await models.RiskAssessmentIndicators.find(
          {
            assessmentId,
            indicatorId: { $in: indicatorIds },
            status: { $ne: 'In Progress' }
          }
        );
        if (calculatedIndicators.length === indicatorIds.length) {
          const riskAssessmentIndicators = await models.RiskAssessmentIndicators.find(
            {
              assessmentId,
              indicatorId: { $in: indicatorIds }
            }
          );

          let totalCount = calculateMethod === 'Multiply' ? 1 : 0;

          for (const riskAssessmentIndicator of riskAssessmentIndicators) {
            if (calculateMethod === 'Multiply') {
              totalCount *= riskAssessmentIndicator.totalScore;
            }
            if (['Addition', 'Average'].includes(calculateMethod)) {
              totalCount += riskAssessmentIndicator.totalScore;
            }
          }

          if (calculateMethod === 'Average') {
            totalCount = totalCount / (indicatorIds.length || 1);
          }

          await calculateResult({
            collection: models.RiskAssessmentGroups,
            calculateLogics,
            resultScore: totalCount,
            filter: {
              assessmentId,
              groupId: group._id
            }
          });
        }
      }
    }

    static async calculateRiskIndicator({
      assessmentId,
      indicatorId,
      cardId,
      cardType
    }: CommonTypes) {
      const indicator = await models.RiskIndicators.findOne({
        _id: indicatorId
      });
      if (!indicator) {
        throw new Error(
          'Cannot find indicator when trying to calculate indicator result'
        );
      }
      let { calculateLogics, calculateMethod, forms } = indicator;

      if (forms?.length === 1) {
        calculateLogics = forms[0].calculateLogics;
      }

      const assignedUserIds = (
        await getAsssignedUsers(subdomain, cardId || '', cardType || '')
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

    static async calculateAssessment({ assessmentId }: CommonTypes) {
      const riskAssessment = await models.RiskAssessments.findOne({
        _id: assessmentId
      });

      if (!riskAssessment) {
        return 'Cannot find risk assessment';
      }

      const { groupId, cardId, cardType } = riskAssessment;

      if (groupId) {
        const indicatorsGroup = await models.IndicatorsGroups.findOne({
          _id: groupId
        });

        if (!indicatorsGroup) {
          throw new Error('Invalid indicators group id');
        }

        const {
          _id,
          groups,
          calculateLogics,
          calculateMethod,
          ignoreZeros
        } = indicatorsGroup;

        const assignedUsersCount = (
          await getAsssignedUsers(subdomain, cardId, cardType)
        ).length;

        const groupIds = groups.map(group => group._id);

        const assessmentGroups = await models.RiskAssessmentGroups.find({
          assessmentId: riskAssessment._id,
          groupId: { $in: groupIds }
        });

        let totalCount = calculateMethod === 'Multiply' ? 1 : 0;

        const residualPW = assessmentGroups.reduce((acc, curr) => {
          if (!curr.resultScore) {
            const group = groups.find(group =>
              assessmentGroups.find(
                assessmentGroup => assessmentGroup.groupId === group._id
              )
            );

            return acc + (group?.percentWeight || 0);
          } else {
            return acc;
          }
        }, 0);
        const residualPWCount = assessmentGroups.filter(
          group => group.resultScore
        ).length;

        for (const assessmentGroup of assessmentGroups) {
          const percentWeight = () => {
            let percentWeight = 100;

            const group = groups.find(
              group => group._id === assessmentGroup.groupId
            );

            if (group) {
              percentWeight = group.percentWeight || 100;
            }
            if (ignoreZeros) {
              percentWeight =
                percentWeight +
                Number((residualPW / residualPWCount).toFixed(2));
            }

            return percentWeight;
          };

          (groups.find(group => group._id === assessmentGroup.groupId) || {})
            ?.percentWeight || 100;

          if (calculateMethod === 'Multiply') {
            totalCount *= assessmentGroup.resultScore * (percentWeight() / 100);
          }
          if (['Addition', 'Average'].includes(calculateMethod)) {
            totalCount += assessmentGroup.resultScore * (percentWeight() / 100);
          }
        }
        if (calculateMethod === 'Average') {
          totalCount = totalCount / (assessmentGroups?.length || 1);
        }

        const groupResult = await calculateResult({
          collection: models.RiskAssessmentGroups,
          calculateLogics,
          resultScore: totalCount,
          filter: { groupId: _id, assessmentId }
        });

        await models.RiskAssessments.findByIdAndUpdate(assessmentId, {
          $set: {
            totalScore: roundResult(totalCount),
            resultScore: roundResult(totalCount / (assignedUsersCount || 1)),
            status: groupResult.status,
            statusColor: groupResult.statusColor,
            closedAt: Date.now()
          }
        });
      } else {
        const riskAssessment = await models.RiskAssessments.findOne({
          _id: assessmentId
        });
        if (!riskAssessment) {
          return;
        }
        const { indicatorId } = riskAssessment;
        const riskAssessmentIndicator = await models.RiskAssessmentIndicators.findOne(
          { assessmentId: assessmentId, indicatorId: indicatorId }
        );

        await models.RiskAssessments.updateOne(
          { _id: assessmentId },
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

  formSubmissionSchema.loadClass(FormSubmissionsClass);
  return formSubmissionSchema;
};
