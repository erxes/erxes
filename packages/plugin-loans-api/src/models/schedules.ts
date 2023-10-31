import { ISchedule, scheduleSchema } from './definitions/schedules';
import { IScheduleDocument } from './definitions/schedules';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { FilterQuery } from 'mongodb';
export interface IScheduleModel extends Model<IScheduleDocument> {
  getSchedule(selector: FilterQuery<IScheduleDocument>);
  createSchedule(doc: ISchedule);
  updateSchedule(_id: string, doc: IScheduleDocument);
  removeSchedule(_ids: string[]);
}
export const loadScheduleClass = (models: IModels) => {
  class Schedule {
    /**
     *
     * Get Schedule Cagegory
     */

    public static async getSchedule(selector: FilterQuery<IScheduleDocument>) {
      const schedule = await models.Schedules.findOne(selector);

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      return schedule;
    }

    /**
     * Create a schedule
     */
    public static async createSchedule(doc: ISchedule) {
      return models.Schedules.create(doc);
    }

    /**
     * Update Schedule
     */
    public static async updateSchedule(_id: string, doc: IScheduleDocument) {
      await models.Schedules.updateOne({ _id }, { $set: doc });

      return models.Schedules.findOne({ _id });
    }

    /**
     * Remove Schedule
     */
    public static async removeSchedule(_ids: string[]) {
      return models.Schedules.deleteMany({ _id: _ids });
    }
  }
  scheduleSchema.loadClass(Schedule);
  return scheduleSchema;
};
