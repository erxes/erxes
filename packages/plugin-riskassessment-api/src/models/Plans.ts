import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { PLAN_STATUSES } from '../common/constants';
import { validatePlan } from '../common/validateDoc';
import { IModels } from '../connectionResolver';
import { sendCardsMessage } from '../messageBroker';
import { IPlansDocument, plansSchema } from './definitions/plan';
import * as moment from 'moment';
export interface IPlansModel extends Model<IPlansDocument> {
  addPlan(doc, user): Promise<IPlansDocument>;
  editPlan(_id, doc): Promise<IPlansDocument>;
  duplicatePlan(_id, user): Promise<IPlansDocument>;
  removePlans(ids: string[]): Promise<IPlansDocument>;
  forceStartPlan(_id: string): Promise<IPlansDocument>;
  addSchedule(planId, doc): Promise<IPlansDocument>;
  editSchedule(args): Promise<IPlansDocument>;
  removeSchedule(_id): Promise<IPlansDocument>;
}

export const loadPlans = (models: IModels, subdomain: string) => {
  class Plans {
    public static async addPlan(doc, user) {
      try {
        await validatePlan({ models, doc });
      } catch (error) {
        throw new Error(error.message);
      }

      return models.Plans.create({ ...doc, plannerId: user._id });
    }

    public static async editPlan(_id, doc) {
      if (!(await models.Plans.findOne({ _id }))) {
        throw new Error('Not Found');
      }

      return await models.Plans.updateOne(
        { _id },
        {
          $set: { ...doc, modifiedAt: Date.now() }
        }
      );
    }

    public static async removePlans(ids) {
      await models.Schedules.deleteMany({ planId: { $in: ids } });

      const plans = await models.Plans.find({ _id: { $in: ids } });

      for (const plan of plans) {
        if (plan.status === PLAN_STATUSES.ARCHIVED && !!plan?.cardIds?.length) {
          await sendCardsMessage({
            subdomain,
            action: `${plan?.configs?.cardType}s.remove`,
            data: {
              _ids: plan.cardIds
            },
            isRPC: true
          });
        }
      }

      return models.Plans.deleteMany({ _id: { $in: ids } });
    }

    public static async duplicatePlan(planId: string, user: IUserDocument) {
      const plan = await models.Plans.findOne({ _id: planId }).lean();
      if (!plan) {
        throw new Error('Not Found');
      }

      const schedules = await models.Schedules.find({
        planId: plan._id
      }).lean();

      const {
        _id,
        plannerId,
        createdAt,
        modifiedAt,
        status,
        cardIds,
        name,
        ...planDoc
      } = plan;

      const newPlan = await models.Plans.create({
        ...planDoc,
        name: `${name} - copied`,
        plannerId: user._id
      });

      const newSchedulesDoc = schedules.map(
        ({
          name,
          indicatorId,
          groupId,
          structureTypeId,
          assignedUserIds,
          customFieldsData
        }) => ({
          planId: newPlan._id,
          name,
          indicatorId,
          groupId,
          structureTypeId,
          assignedUserIds,
          customFieldsData
        })
      );

      await models.Schedules.insertMany(newSchedulesDoc);

      return newPlan;
    }

    public static async forceStartPlan(_id: string) {
      const plan = await models.Plans.findOne({
        _id,
        status: { $ne: PLAN_STATUSES.ARCHIVED }
      });

      if (!plan) {
        throw new Error('not found');
      }

      const { startDate, closeDate, configs, plannerId, structureType } = plan;

      if (!configs?.cardType && !configs?.stageId) {
        throw new Error('Please provide a specify cards configuration');
      }

      const schedules = await models.Schedules.find({
        planId: plan._id
      });

      if (!schedules?.length) {
        throw new Error('You must add at least one schedule in plan');
      }

      const commonDoc = {
        startDate,
        closeDate,
        stageId: configs.stageId,
        userId: plannerId
      };

      let newItemIds: string[] = [];

      for (const schedule of schedules) {
        const itemDoc = {
          ...commonDoc,
          name: schedule.name,
          assignedUserIds: schedule.assignedUserIds,
          customFieldsData: schedule.customFieldsData
        };

        if (['branch', 'department'].includes(structureType)) {
          itemDoc[`${structureType}Ids`] = schedule?.structureTypeId
            ? [schedule.structureTypeId]
            : [];
        }

        const newItem = await sendCardsMessage({
          subdomain,
          action: `${configs.cardType}s.create`,
          data: itemDoc,
          isRPC: true,
          defaultValue: null
        });

        await models.RiskAssessments.addRiskAssessment({
          cardType: configs.cardType,
          cardId: newItem._id,
          indicatorId: schedule.indicatorId,
          [`${structureType}Id`]: schedule.structureTypeId || ''
        });

        newItemIds = [...newItemIds, newItem?._id];
      }

      return await models.Plans.updateOne(
        { _id: plan._id },
        { status: PLAN_STATUSES.ARCHIVED, cardIds: newItemIds }
      );
    }

    public static async addSchedule(planId: string, doc: any) {
      const plan = models.Plans.findOne({ _id: planId });

      if (!plan) {
        throw new Error('Cannot find schedule');
      }

      return await models.Schedules.create({ planId, ...doc });
    }

    public static async editSchedule(args: any) {
      const { _id, planId, ...doc } = args;

      const updatedSchedule = await models.Schedules.findOneAndUpdate(
        { _id, planId, status: 'Waiting' },
        { $set: { ...doc } }
      );

      if (!updatedSchedule) {
        throw new Error('Could not update schedule');
      }

      return updatedSchedule;
    }
    public static async removeSchedule(_id: string) {
      return await models.Schedules.findByIdAndDelete(_id);
    }
  }

  plansSchema.loadClass(Plans);
  return plansSchema;
};
