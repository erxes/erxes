import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { sendFormsMessage } from '../messageBroker';
import { getAsssignedUsers, getIndicatorSubmissions } from '../utils';
import {
  IRiskAssessmentIndicatorsDocument,
  IRiskAssessmentsDocument,
  riskAssessmentsSchema
} from './definitions/riskassessment';
export interface IRiskAssessmentsModel extends Model<IRiskAssessmentsDocument> {
  addRiskAssessment(params): Promise<IRiskAssessmentsDocument>;
  addBulkRiskAssessment(params): Promise<IRiskAssessmentsDocument>;
  riskAssessmentDetail(_id: string): Promise<any>;
  riskAssessmentFormSubmissionDetail(parmas): Promise<any>;
  editRiskAssessment(_id: string, doc: any): Promise<IRiskAssessmentsDocument>;
  removeRiskAssessment(_id: string);
  riskAssessmentAssignedMembers(
    cardId: string,
    cardType: string
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
      const { indicatorId, groupId, groupsAssignedUsers } = params;

      const riskAssessment = await models.RiskAssessments.create({
        ...params,
        isSplittedUsers: await this.checkSplittedUsersByGroup(
          groupsAssignedUsers
        )
      });

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
            const groupAssignedUsers = (groupsAssignedUsers || []).find(
              item => item.groupId === group._id
            );
            await models.RiskAssessmentGroups.create({
              assessmentId: riskAssessment._id,
              groupId: group._id,
              assignedUserIds: groupAssignedUsers?.assignedUserIds
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

    public static async addBulkRiskAssessment(params) {
      const { cardType, cardId, bulkItems } = params;

      if (!cardId && !cardType) {
        throw new Error('please provide a card type and a card id');
      }

      let doc = { cardId, cardType };

      const createByIds = async (
        ids: string,
        fieldName: string,
        groupId,
        indicatorId,
        groupsAssignedUsers: any[]
      ) => {
        if (!!ids?.length) {
          for (const id of ids) {
            {
              await this.addRiskAssessment({
                ...doc,
                groupId: !!groupId ? groupId : undefined,
                indicatorId: !!indicatorId ? indicatorId : undefined,
                [fieldName]: id,
                groupsAssignedUsers
              });
            }
          }
        }
      };

      for (const item of bulkItems) {
        const {
          branchIds,
          departmentIds,
          operationIds,
          groupId,
          indicatorIds,
          indicatorId,
          groupsAssignedUsers
        } = item;
        const IdsMap = [
          { key: 'branchId', ids: branchIds },
          { key: 'departmentId', ids: departmentIds },
          { key: 'operationId', ids: operationIds }
        ];

        if (!!indicatorIds?.length) {
          IdsMap.push({ key: 'indicatorId', ids: indicatorIds });
        }

        for (const { ids, key } of IdsMap) {
          createByIds(ids, key, groupId, indicatorId, groupsAssignedUsers);
        }
      }
    }

    public static async editRiskAssessment(_id, doc) {
      const riskAssessment = await models.RiskAssessments.findOne({ _id });

      if (!riskAssessment) {
        throw new Error('Could not find risk assessment');
      }

      const { indicatorId, groupId, groupsAssignedUsers } = doc;
      let unsetFields: any = {};

      /**
       * Update risk assessment groups if has groupId
       */

      if (indicatorId && groupId) {
        for (const [key] of Object.entries(riskAssessment.toObject())) {
          if (['indicatorId', 'groupId'].includes(key)) {
            if (riskAssessment[key]) {
              delete doc[key];
              unsetFields = { [key]: 1 };
            }
          }
        }
      }

      if (await this.checkSplittedUsersByGroup(groupsAssignedUsers)) {
        const groupIds = await this.getGroupIds(groupId);
        for (const groupId of groupIds) {
          const groupAssignedUsers = groupsAssignedUsers.find(
            group => group.groupId === groupId
          );
          await models.RiskAssessmentGroups.updateOne(
            { assessmentId: riskAssessment._id, groupId },
            {
              $set: {
                assignedUserIds: groupAssignedUsers?.assignedUserIds || []
              }
            }
          );
        }

        if (!riskAssessment.isSplittedUsers) {
          await models.RiskAssessments.updateOne(
            { _id: riskAssessment._id },
            { $set: { isSplittedUsers: true } }
          );
        }
      }
      if (
        groupId &&
        groupId !== riskAssessment.groupId &&
        !riskAssessment.indicatorId
      ) {
        const indicatorIds = await this.getGroupsIndicatorIds(groupId);
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
        { $set: { ...doc }, $unset: { ...unsetFields } }
      );
    }

    public static async removeRiskAssessment(_id) {
      const riskAssessment = await models.RiskAssessments.findOne({ _id });

      if (!riskAssessment) {
        throw new Error('Could not find risk assessment');
      }

      if (riskAssessment.groupId) {
        await models.RiskAssessmentGroups.deleteMany({
          assessmentId: riskAssessment._id
        });
      }

      await models.RiksFormSubmissions.deleteMany({
        assessmentId: riskAssessment._id
      });

      await models.RiskAssessmentIndicators.deleteOne({
        assessmentId: riskAssessment._id
      });

      return riskAssessment.remove();
    }

    public static async riskAssessmentAssignedMembers(cardId, cardType) {
      const riskAssessments = await models.RiskAssessments.find({
        cardId,
        cardType
      });

      if (!riskAssessments.length) {
        throw new Error('Could not find risk assessment');
      }

      const riskAssessmentIds = riskAssessments.map(
        riskAssessment => riskAssessment._id
      );

      let riskAssessmentIndicatorIds = (
        await models.RiskAssessmentIndicators.find({
          assessmentId: { $in: riskAssessmentIds }
        })
      ).map(riskAssessmentIndicator => riskAssessmentIndicator.indicatorId);

      let assignedUsers = await getAsssignedUsers(subdomain, cardId, cardType);

      for (const assignedUser of assignedUsers) {
        for (const riskAssessment of riskAssessments) {
          if (riskAssessment.isSplittedUsers) {
            let indicatorIds: string[] = [];
            const riskAssessmentGroups = await models.RiskAssessmentGroups.find(
              {
                assessmentId: riskAssessment._id,
                assignedUserIds: { $in: [assignedUser._id] }
              }
            );

            for (const riskAssessmentGroup of riskAssessmentGroups) {
              const groupIndicatorIds = await this.getGroupIndicatorIds(
                riskAssessmentGroup.groupId
              );
              indicatorIds = [...indicatorIds, ...groupIndicatorIds];
            }

            riskAssessmentIndicatorIds = indicatorIds;
          }
        }
        const submittedResults = await models.RiksFormSubmissions.aggregate([
          {
            $match: {
              assessmentId: { $in: riskAssessmentIds },
              indicatorId: { $in: riskAssessmentIndicatorIds },
              userId: assignedUser._id
            }
          },
          {
            $group: {
              _id: '$assessmentId',
              indicatorIds: {
                $addToSet: '$$ROOT.indicatorId'
              },
              count: { $sum: 1 }
            }
          }
        ]);

        if (!submittedResults.length) {
          assignedUser.submitStatus = 'pending';
        }

        if (
          submittedResults.length >= 1 &&
          riskAssessmentIndicatorIds.some(indicatorId =>
            submittedResults.find(result =>
              result.indicatorIds.includes(indicatorId)
            )
          )
        ) {
          assignedUser.submitStatus = 'inProgress';
        }

        if (
          submittedResults.length >= 1 &&
          riskAssessmentIds.every(assessmentId =>
            submittedResults.some(
              result =>
                result._id === assessmentId &&
                riskAssessmentIndicatorIds.every(indicatorId =>
                  result.indicatorIds.includes(indicatorId)
                )
            )
          )
        ) {
          assignedUser.submitStatus = 'submitted';
        }
      }

      if (
        riskAssessments.every(assessment => assessment.status !== 'In Progress')
      ) {
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

      let riskAssessmentIndicatorIds = (
        await models.RiskAssessmentIndicators.find({
          assessmentId: riskAssessment._id
        })
      ).map(riskAssessmentIndicator => riskAssessmentIndicator.indicatorId);

      const { isSplittedUsers, groupId } = riskAssessment;

      if (groupId && isSplittedUsers) {
        const indicatorsGroup = await models.IndicatorsGroups.findOne({
          _id: groupId
        });

        const groupIds = (indicatorsGroup?.groups || []).map(
          group => group._id
        );

        const assessmentGroups = await models.RiskAssessmentGroups.find({
          assessmentId: riskAssessment._id,
          groupId: { $in: groupIds },
          assignedUserIds: { $in: [userId] }
        });

        let indicatorIds: string[] = [];

        for (const assessmentGroup of assessmentGroups) {
          for (const group of indicatorsGroup?.groups || []) {
            if (assessmentGroup.groupId === group._id) {
              indicatorIds = [...indicatorIds, ...group.indicatorIds];
            }
          }
        }

        riskAssessmentIndicatorIds = riskAssessmentIndicatorIds.filter(
          indicatorId => indicatorIds.includes(indicatorId)
        );
      }

      const indicators = await models.RiskIndicators.find({
        _id: { $in: riskAssessmentIndicatorIds }
      }).lean();

      for (const indicator of indicators) {
        const submitted = await models.RiksFormSubmissions.findOne({
          assessmentId: riskAssessment._id,
          indicatorId: indicator._id,
          userId
        });

        if (riskAssessment.groupId) {
          const indicatorsGroup = await models.IndicatorsGroups.findOne({
            _id: riskAssessment.groupId,
            'groups.indicatorIds': { $in: [indicator._id] }
          });

          let groups = indicatorsGroup?.groups || [];

          for (const group of groups) {
            if (group.indicatorIds.includes(indicator._id)) {
              indicator.group = group;
            }
          }
        }

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

      const { forms } = indicator.toObject();

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

      const editedSubmittedFields = {};

      for (const submittedField of submittedFields) {
        editedSubmittedFields[submittedField.fieldId] = {
          value: submittedField.value,
          description: submittedField.description
        };
      }
      return {
        fields,
        withDescription: indicator.isWithDescription,
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

      const assignedUsers = await models.RiskAssessments.riskAssessmentAssignedMembers(
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
            const submissions = await getIndicatorSubmissions({
              models,
              assessmentId: riskAssessment._id,
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

        indicatorAssessment.submissions = await getIndicatorSubmissions({
          models,
          assessmentId: riskAssessment._id,
          cardId,
          cardType,
          indicatorId: indicatorAssessment.indicatorId,
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

    static async getGroupsIndicatorIds(groupId: string) {
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

    static async getGroupIndicatorIds(groupId: string) {
      let indicatorIds: string[] = [];

      const indicatorsGroups = await models.IndicatorsGroups.findOne({
        'groups._id': groupId
      });

      for (const indicatorGroup of indicatorsGroups?.groups || []) {
        if (indicatorGroup._id === groupId) {
          indicatorIds = indicatorGroup.indicatorIds || [];
        }
      }

      return indicatorIds;
    }

    static async getGroupIds(groupId) {
      let groupIds: string[] = [];

      const indicatorsGroups = await models.IndicatorsGroups.find({
        _id: groupId
      });
      for (const { groups } of indicatorsGroups) {
        for (const group of groups) {
          groupIds = [...groupIds, group._id];
        }
      }
      return groupIds;
    }

    static async checkSplittedUsersByGroup(groupsAssignedUsers) {
      return (
        !!groupsAssignedUsers?.length &&
        groupsAssignedUsers?.every(group => group?.assignedUserIds?.length)
      );
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
