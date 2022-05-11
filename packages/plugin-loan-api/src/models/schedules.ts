import { scheduleSchema } from './definitions/schedules';
import { IScheduleDocument } from '../models/definitions/schedules';
import { Model } from 'mongoose';
export interface IScheduleModel extends Model<IScheduleDocument> {
  getSchedule(models, selector: any);
  createSchedule(models, doc);
  updateSchedule(models, _id, doc);
  removeSchedule(models, _id);
}
export const loadScheduleClass = models => {
  class Schedule {
    /**
     *
     * Get Schedule Cagegory
     */

    public static async getSchedule(selector: any) {
      const schedule = await models.RepaymentSchedules.findOne(selector);

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      return schedule;
    }

    /**
     * Create a schedule
     */
    public static async createSchedule(doc) {
      return models.RepaymentSchedules.create(doc);
    }

    /**
     * Update Schedule
     */
    public static async updateSchedule(_id, doc) {
      await models.RepaymentSchedules.updateOne({ _id }, { $set: doc });

      return models.RepaymentSchedules.findOne({ _id });
    }

    /**
     * Remove Schedule
     */
    public static async removeSchedule(_id) {
      await models.RepaymentSchedules.getScheduleCatogery(models, { _id });

      return models.RepaymentSchedules.deleteOne({ _id });
    }
  }
  scheduleSchema.loadClass(Schedule);
  return scheduleSchema;
};
