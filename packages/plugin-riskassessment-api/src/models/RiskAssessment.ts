import { field } from '@erxes/api-utils/src';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendCoreMessage, sendFormsMessage } from '../messageBroker';
import { getAsssignedUsers } from '../utils';
import {
  IRiskAssessmentsDocument,
  IRiskAssessmentIndicatorsDocument,
  riskAssessmentsSchema,
  riskAssessmentIndicatorsSchema
} from './definitions/riskassessment';
export interface IRiskAssessmentsModel extends Model<IRiskAssessmentsDocument> {
  addRiskAssessment(params): Promise<IRiskAssessmentsDocument>;
  riskAssessmentDetail(_id: string): Promise<any>;
  riskAssessmentFormSubmissionDetail(parmas): Promise<any>;
  editRiskAssessment(_id: string, doc: any): Promise<IRiskAssessmentsDocument>;
  removeRiskAssessment(_id: string);
  riskAssessmentAssignedMembers(
    cardId: string,
    cardType: string,
    riskAssessmentId: string
  ): Promise<IRiskAssessmentsDocument>;
  riskAssessmentSubmitForm(
    cardId: string,
    cardType: string,
    riskAssessmentId: string,
    userId: string
  ): Promise<IRiskAssessmentsDocument>;
  riskAssessmentIndicatorForm(
    riskAssessmentId: string,
    indicatorId: string,
    userId: string
  ): Promise<IRiskAssessmentsDocument>;
}

export const loadRiskAssessments = (models: IModels, subdomain: string) => {
  class RiskAssessment {
    public static async addRiskAssessment(params) {
      const { indicatorId, groupId } = params;

      const riskAssessment = await models.RiskAssessments.create({ ...params });

      let ids: string[] = [];

      if (indicatorId) {
        ids = [indicatorId];
      }

      if (groupId) {
        const indicatorsGroups = await models.IndicatorsGroups.find({
          _id: groupId
        });
        for (const { groups } of indicatorsGroups) {
          for (const group of groups) {
            ids = [...ids, ...group.indicatorIds];
            await models.RiskAssessmentGroups.create({
              assessmentId: riskAssessment._id,
              groupId: group._id
            });
          }
        }
        await models.RiskAssessmentGroups.create({
          assessmentId: riskAssessment._id,
          groupId
        });
      }
      const indicators = await models.RiskIndicators.find({
        _id: { $in: ids }
      });

      for (const indicator of indicators)
        [
          await models.RiskAssessmentIndicators.create({
            assessmentId: riskAssessment._id,
            indicatorId: indicator._id
          })
        ];

      return riskAssessment;
    }

    public static async editRiskAssessment(_id, doc) {
      const riskAssessment = await models.RiskAssessments.findOne({ _id });

      if (!riskAssessment) {
        throw new Error('Could not find risk assessment');
      }

      const { indicatorId, groupId } = doc;

      if (
        groupId &&
        groupId !== riskAssessment.groupId &&
        !riskAssessment.indicatorId
      ) {
        const indicatorIds = await this.getGroupIndicatorIds(groupId);
        const riskAssessmentIndicators = await models.RiskAssessmentIndicators.find(
          { assessmentId: _id }
        );

        const removeIds = riskAssessmentIndicators
          .filter(
            assessmentIndicator =>
              !indicatorIds.includes(assessmentIndicator.indicatorId)
          )
          .map(assessmentIndicator => assessmentIndicator._id);

        const addItems = indicatorIds
          .filter(indicatorId =>
            riskAssessmentIndicators.some(
              riskAssessmentIndicator =>
                riskAssessmentIndicator.indicatorId !== indicatorId
            )
          )
          .map(indicatorId => ({ assessmentId: _id, indicatorId }));

        await models.RiskAssessmentIndicators.deleteMany({
          _id: { $in: removeIds }
        });

        await models.RiskAssessmentIndicators.insertMany(addItems);
      }

      if (
        indicatorId &&
        !riskAssessment.groupId &&
        indicatorId !== indicatorId
      ) {
        const riskAssessmentIndicator = await models.RiskAssessmentIndicators.findOne(
          { assessmentId: _id, indicatorId }
        );
        riskAssessmentIndicator?.remove();
        await models.RiskAssessmentIndicators.create({
          assessmentId: _id,
          indicatorId
        });
      }

      return await models.RiskAssessments.updateOne(
        { _id },
        { $set: { ...doc } }
      );
    }

    public static async removeRiskAssessment(_id) {
      const riskAssessment = await models.RiskAssessments.findOne({ _id });

      if (!riskAssessment) {
        throw new Error('Could not find risk assessment');
      }

      if (riskAssessment.groupId) {
        const indicatorIds = await this.getGroupIndicatorIds(
          riskAssessment.groupId
        );
        await models.RiskAssessmentIndicators.deleteMany({
          assessmentId: riskAssessment._id,
          indicatorId: { $in: indicatorIds }
        });
      }

      if (riskAssessment.indicatorId) {
        await models.RiskAssessmentIndicators.deleteOne({
          assessmentId: riskAssessment._id,
          indicatorId: riskAssessment.indicatorId
        });
      }

      return riskAssessment.remove();
    }

    public static async riskAssessmentAssignedMembers(
      cardId,
      cardType,
      riskAssessmentId
    ) {
      const riskAssessment = await models.RiskAssessments.findOne({
        _id: riskAssessmentId
      });

      if (!riskAssessment) {
        throw new Error('Could not find risk assessment');
      }

      const riskAssessmentIndicatorIds = (
        await models.RiskAssessmentIndicators.find({
          assessmentId: riskAssessment._id
        })
      ).map(riskAssessmentIndicator => riskAssessmentIndicator.indicatorId);

      let assignedUsers = await getAsssignedUsers(subdomain, cardId, cardType);

      for (const assignedUser of assignedUsers) {
        const submittedResults = await models.RiksFormSubmissions.aggregate([
          {
            $match: {
              assessmentId: riskAssessment._id,
              indicatorId: { $in: riskAssessmentIndicatorIds },
              userId: assignedUser._id
            }
          },
          {
            $group: {
              _id: '$indicatorId',
              count: { $sum: 1 }
            }
          }
        ]);

        if (!submittedResults.length) {
          assignedUser.submitStatus = 'pending';
        }
        if (submittedResults.length === riskAssessmentIndicatorIds.length) {
          assignedUser.submitStatus = 'submitted';
        }
        if (
          submittedResults.length >= 1 &&
          submittedResults.length < riskAssessmentIndicatorIds.length
        ) {
          assignedUser.submitStatus = 'inProgress';
        }
      }

      if (riskAssessment.status !== 'In Progress') {
        assignedUsers = assignedUsers.filter(
          user => user.submitStatus === 'submitted'
        );
      }

      return assignedUsers;
    }

    public static async riskAssessmentSubmitForm(
      cardId,
      cardType,
      riskAssessmentId,
      userId
    ) {
      const riskAssessment = await models.RiskAssessments.findOne({
        _id: riskAssessmentId,
        cardId,
        cardType
      });

      if (!riskAssessment) {
        throw new Error('Could not find risk assessment');
      }

      const riskAssessmentIndicatorIds = (
        await models.RiskAssessmentIndicators.find({
          assessmentId: riskAssessment._id
        })
      ).map(riskAssessmentIndicator => riskAssessmentIndicator.indicatorId);

      const indicators = await models.RiskIndicators.find({
        _id: { $in: riskAssessmentIndicatorIds }
      }).lean();

      for (const indicator of indicators) {
        const submitted = await models.RiksFormSubmissions.findOne({
          assessmentId: riskAssessment._id,
          indicatorId: indicator._id,
          userId
        });

        if (submitted) {
          indicator.submitted = true;
        } else {
          indicator.submitted = false;
        }
      }
      return indicators;
    }

    public static async riskAssessmentIndicatorForm(
      riskAssessmentId,
      indicatorId,
      userId
    ) {
      const riskAssessment = await models.RiskAssessments.findOne({
        _id: riskAssessmentId
      });
      if (!riskAssessment) {
        throw new Error('Could not find risk assessment');
      }

      const indicator = await models.RiskIndicators.findOne({
        _id: indicatorId
      });

      if (!indicator) {
        throw new Error('Cannot find indicator');
      }

      const { customScoreField, forms } = indicator.toObject();

      const formIds = forms?.map(form => form.formId);

      const query = { contentType: 'form', contentTypeId: { $in: formIds } };

      const fields = await sendFormsMessage({
        subdomain,
        action: 'fields.find',
        data: { query },
        isRPC: true,
        defaultValue: []
      });

      const submittedFields = await models.RiksFormSubmissions.find({
        assessmentId: riskAssessment._id,
        indicatorId,
        userId,
        formId: { $in: formIds }
      });

      const customScore = await models.RiksFormSubmissions.findOne({
        assessmentId: riskAssessment._id,
        indicatorId,
        userId,
        contentType: 'customScore'
      });

      const editedSubmittedFields = {};

      for (const submittedField of submittedFields) {
        editedSubmittedFields[submittedField.fieldId] = submittedField.value;
      }

      return {
        fields,
        customScoreField: {
          ...customScoreField,
          value: customScore?.value
        },
        submittedFields: editedSubmittedFields
      };
    }

    public static async riskAssessmentDetail(_id) {
      const riskAssessment = await models.RiskAssessments.findOne({
        _id
      }).lean();

      if (!riskAssessment) {
        throw new Error('Cannot find assessment');
      }

      const { cardId, cardType, groupId, indicatorId } = riskAssessment;

      const assignedUsers = await getAsssignedUsers(
        subdomain,
        cardId,
        cardType
      );

      const assessment: any = { ...riskAssessment, assignedUsers };

      if (groupId) {
        const indicatorsGroup = await models.IndicatorsGroups.findOne({
          _id: groupId
        });

        const groupAssessments: any[] = [];

        for (const group of indicatorsGroup?.groups || []) {
          const groupAssessment = await models.RiskAssessmentGroups.findOne({
            assessmentId: riskAssessment._id,
            groupId: group._id
          }).lean();

          const indicatorsAssessments = await models.RiskAssessmentIndicators.find(
            {
              assessmentId: riskAssessment._id,
              indicatorId: { $in: group.indicatorIds }
            }
          ).lean();

          for (const indicatorAssessment of indicatorsAssessments) {
            const indicator = await models.RiskIndicators.findOne({
              _id: indicatorAssessment.indicatorId
            });
            indicatorAssessment.name = indicator?.name;
            const submissions = await this.getIndicatorSubmissions({
              riskAssessment,
              cardId,
              cardType,
              indicatorId: indicatorAssessment.indicatorId,
              subdomain
            });
            indicatorAssessment.submissions = submissions;
          }
          groupAssessment.indicatorsAssessments = indicatorsAssessments;
          groupAssessments.push(groupAssessment);
        }
        assessment.groupAssessment = groupAssessments;
      }
      if (indicatorId) {
        const indicatorAssessment = await models.RiskAssessmentIndicators.findOne(
          { assessmentId: riskAssessment._id, indicatorId }
        ).lean();

        indicatorAssessment.submissions = await this.getIndicatorSubmissions({
          cardId,
          cardType,
          riskAssessment,
          indicatorId,
          subdomain
        });

        assessment.indicatorAssessment = indicatorAssessment;
      }
      return assessment;
    }

    public static async riskAssessmentFormSubmissionDetail(params) {
      const { cardId, cardType, riskAssessmentId } = params;

      const riskAssessment = await models.RiskAssessments.findOne({
        _id: riskAssessmentId
      });

      if (!riskAssessment) {
        throw new Error(`Could not find Risk Assessment`);
      }

      const { indicatorId, groupId } = riskAssessment;

      if (groupId) {
        let indicatorIds: string[] = [];

        const indicatorGroup = await models.IndicatorsGroups.findOne({
          _id: groupId
        });

        for (const group of indicatorGroup?.groups || []) {
          indicatorIds = [...indicatorIds, ...group.indicatorIds];
        }

        const result = await models.RiksFormSubmissions.aggregate([
          {
            $match: {
              cardId,
              cardType,
              assessmentId: riskAssessmentId,
              indicatorId: { $in: indicatorIds }
            }
          },
          {
            $group: {
              indicatorId: '$indicatorId',
              fields: { $push: '$$ROOT' },
              count: { $sum: 1 }
            }
          }
        ]);
        return;
      }
    }

    static async getGroupIndicatorIds(groupId: string) {
      let indicatorIds: string[] = [];
      const indicatorsGroups = await models.IndicatorsGroups.find({
        _id: groupId
      });
      for (const { groups } of indicatorsGroups) {
        for (const group of groups) {
          indicatorIds = [...indicatorIds, ...group.indicatorIds];
        }
      }

      return indicatorIds;
    }
    static async getIndicatorSubmissions({
      riskAssessment,
      cardId,
      cardType,
      indicatorId,
      subdomain
    }) {
      const submissions = await models.RiksFormSubmissions.aggregate([
        {
          $match: {
            assessmentId: riskAssessment._id,
            cardId,
            cardType,
            indicatorId
          }
        },
        {
          $group: {
            _id: '$userId',
            fields: { $push: '$$ROOT' },
            count: { $sum: 1 }
          }
        }
      ]);

      for (const submission of submissions) {
        for (const field of submission.fields) {
          const fieldDetail = await sendFormsMessage({
            subdomain,
            action: 'fields.findOne',
            data: {
              query: { _id: field.fieldId }
            },
            isRPC: true,
            defaultValue: {}
          });

          field.optionsValues = fieldDetail.optionsValues;
          field.text =
            field.contentType === 'customScore'
              ? 'Custom Score'
              : fieldDetail.text;
        }
      }
      return submissions;
    }
  }
  riskAssessmentsSchema.loadClass(RiskAssessment);
  return riskAssessmentsSchema;
};

export interface IRiskAssessmentIndicatorsModel
  extends Model<IRiskAssessmentIndicatorsDocument> {
  addIndicator(): Promise<IRiskAssessmentIndicatorsDocument>;
  updateIndicator(): Promise<IRiskAssessmentIndicatorsDocument>;
}
