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
    filter.riskIndicatorId = params.indicatorId;
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
  return filter;
};

export const loadRiskFormSubmissions = (models: IModels, subdomain: string) => {
  class FormSubmissionsClass {
    public static async formSaveSubmission(params: IRiskFormSubmissionParams) {
      const {
        formSubmissions,
        cardId,
        cardType,
        indicatorId,
        customScore
      } = params;

      const filter = generateFields(params);
      console.log({ filter });

      const conformity = await models.RiskConformity.findOne({
        cardId,
        cardType
      }).lean();

      if (!conformity) {
        throw new Error(`Not selected some risk assessment on ${cardType}`);
      }

      const riskAssessment = await models.RiskAssessments.findOne({
        _id: conformity.riskAssessmentId
      });

      if (!riskAssessment) {
        throw new Error('Somethin went wrong');
      }

      console.log({ params });

      // const { resultScore } = riskAssessment;

      const { forms, customScoreField } = await models.RiskIndicators.findOne({
        _id: indicatorId
      }).lean();
      let totalCount = 0;
      let totalPercent = 0;

      if (customScoreField) {
        const percentWeight = customScoreField.percentWeight;
        totalCount = customScore * (percentWeight / 100);
        totalPercent += customScoreField.percentWeight / 100;
      }

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

        if (form.length === 1) {
          const { sumNumber, submissions } = await calculateFormResponses({
            responses: formSubmissions,
            fields,
            calculateMethod: form.calculateMethod,
            filter: { ...filter, riskAssessmentId: conformity.riskAssessmentId }
          });

          await models.RiskAssessmentIndicators.updateOne(
            { assessmentId: conformity.riskAssessmentId, indicatorId },
            { $inc: { resultScore: sumNumber } }
          );
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
            filter: { ...filter, riskAssessmentId: conformity.riskAssessmentId }
          });
          totalCount += sumNumber * (form.percentWeight / 100);
          totalPercent += form.percentWeight / 100;
          await models.RiksFormSubmissions.insertMany(submissions);
        }
      }
      if (forms.length > 1) {
        totalCount = totalCount / totalPercent;
        await models.RiskAssessmentIndicators.updateOne(
          { assessmentId: conformity.riskAssessmentId, indicatorId },
          { $inc: { resultScore: totalCount } }
        );
      }

      if (
        await this.riskAssessmentIndicator({
          cardId,
          cardType,
          riskAssessmentId: conformity.riskAssessmentId,
          riskIndicatorId: indicatorId
        })
      ) {
      }

      if (
        await this.checkriskAssessment({
          riskAssessmentId: conformity.riskAssessmentId
        })
      ) {
      }
    }
    public static async formSubmitHistory(
      cardId: string,
      cardType: string,
      riskAssessmentId: string
    ) {
      // const conformity = await models?.RiskConformity.findOne({
      //   cardId,
      //   cardType,
      //   riskAssessmentId
      // });
      // if (!conformity) {
      //   throw new Error('Cannot find risk assessment');
      // }
      // if (conformity?.status === 'In Progress') {
      //   throw new Error('This risk assessment in progress');
      // }

      // const card = await sendCardsMessage({
      //   subdomain,
      //   action: `${cardType}s.findOne`,
      //   data: { _id: cardId },
      //   isRPC: true,
      //   defaultValue: {}
      // });

      // const formIds = conformity.forms.map(form => form.formId);

      // const submissions = await models.RiksFormSubmissions.aggregate([
      //   {
      //     $match: {
      //       cardId,
      //       cardType,
      //       formId: { $in: formIds },
      //       riskAssessmentId
      //     }
      //   },
      //   {
      //     $group: {
      //       _id: '$userId',
      //       fields: { $push: { fieldId: '$fieldId', value: '$value' } }
      //     }
      //   }
      // ]);
      // for (const submission of submissions) {
      //   const fields: any[] = [];

      //   for (const field of submission.fields) {
      //     const fieldData = await sendFormsMessage({
      //       subdomain,
      //       action: 'fields.find',
      //       data: {
      //         query: {
      //           contentType: 'form',
      //           contentTypeId: { $in: formIds },
      //           _id: field.fieldId
      //         }
      //       },
      //       isRPC: true,
      //       defaultValue: {}
      //     });

      //     let fieldOptionsValues: any[] = [];

      //     const { optionsValues, options } = fieldData[0];

      //     fieldOptionsValues = optionsValues?.split('\n');

      //     if (!optionsValues) {
      //       fieldOptionsValues = options.map(option => `${option}=NaN`);
      //     }

      //     fields.push({
      //       ...field,
      //       optionsValues: fieldOptionsValues,
      //       text: fieldData[0]?.text,
      //       description: fieldData[0]?.description
      //     });
      //   }
      //   submission.fields = fields;
      // }

      // return { cardId, card, cardType, riskAssessmentId, users: submissions };
      return { shit: '' };
    }
    static async checkriskAssessment({ riskAssessmentId }) {
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
    static async riskAssessmentIndicator({
      cardId,
      cardType,
      riskAssessmentId,
      riskIndicatorId
    }) {
      const assignedUserIds = (
        await getAsssignedUsers(subdomain, cardId, cardType)
      ).map(user => user._id);

      const submissions = await models.RiksFormSubmissions.find({
        cardId,
        riskAssessmentId,
        riskIndicatorId,
        userId: { $in: assignedUserIds }
      });

      let submittedUsers: any = {};

      for (const submission of submissions) {
        submittedUsers[submission.userId] = submission;
      }

      return Object.keys(submittedUsers).length === assignedUserIds.length;
    }
    static async calculateRiskIndicators({
      cardId,
      cardType,
      riskAssessmentId,
      riskIndicatorId
    }) {
      const indicator = await models.RiskIndicators.findOne({
        _id: riskIndicatorId
      });
      if (!indicator) {
        return;
      }
      const { forms, calculateLogics } = indicator;

      if ((forms || []).length > 1) {
        const riskAssessmentIndicator = await models.RiskAssessmentIndicators.findOne(
          { assessmentId: riskAssessmentId, indicatorId: riskIndicatorId }
        );

        await calculateResult({
          collection: models.RiskIndicators,
          calculateLogics,
          resultScore: riskAssessmentIndicator?.resultScore,
          filter: {
            assessmentId: riskAssessmentId,
            indicatorId: riskIndicatorId
          }
        });
      }
    }

    static async calculateAssessment({ riskAssessmentId }) {
      const riskAssessment = await models.RiskAssessments.findOne({
        _id: riskAssessmentId
      });

      if (riskAssessment?.groupId) {
        const indicatorsGroups = await models.IndicatorsGroups.findOne({
          _id: riskAssessment?.groupId
        });

        if (!indicatorsGroups) {
          return;
        }

        const {
          groups,
          _id,
          calculateLogics,
          calculateMethod
        } = indicatorsGroups;
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
              totalCount *= riskAssessmentIndicator.resultScore;
            }
            if (calculateMethod === 'Addition') {
              totalCount += riskAssessmentIndicator.resultScore;
            }
          }

          await calculateResult({
            collection: models.RiskAssessmentGroups,
            calculateLogics,
            resultScore: totalCount,
            filter: {
              assessmentId: riskAssessmentId,
              groupId: group._id,
              parentId: _id
            }
          });
        }

        const groupIds = groups.map(group => group._id);

        const assessmentGroups = await models.RiskAssessmentGroups.find({
          parentId: _id,
          assessmentId: riskAssessmentId,
          groupId: { $in: groupIds }
        });

        let totalCount = calculateMethod === 'Multiply' ? 1 : 0;
        for (const assessmentGroup of assessmentGroups) {
          if (calculateMethod === 'Multiply') {
            totalCount *= assessmentGroup.resultScore;
          }
          if (calculateMethod === 'Addition') {
            totalCount += assessmentGroup.resultScore;
          }
        }
        const groupResult = await calculateResult({
          collection: models.RiskAssessmentGroups,
          calculateLogics,
          resultScore: totalCount,
          filter: { groupId: _id, assessmentId: riskAssessmentId }
        });

        await models.RiskAssessments.findByIdAndUpdate(riskAssessmentId, {
          $set: {
            resultScore: totalCount,
            status: groupResult.status,
            statusColor: groupResult.statusColor
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
        const riskAssessmentIndicators = await models.RiskAssessmentIndicators.find(
          { assessmentId: riskAssessmentId, indicatorId: indicatorId }
        );
        const length = riskAssessmentIndicators.length;
        let totalCount = 0;

        for (const riskAssessmentIndicator of riskAssessmentIndicators) {
          totalCount += riskAssessmentIndicator.resultScore;
        }

        await models.RiskAssessments.updateOne(
          { _id: riskAssessmentId },
          { resultScore: totalCount }
        );
      }
    }
  }

  riskConformityFormSubmissionSchema.loadClass(FormSubmissionsClass);
  return riskConformityFormSubmissionSchema;
};
