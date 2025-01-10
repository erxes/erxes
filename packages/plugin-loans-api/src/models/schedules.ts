import {
  ISchedule,
  scheduleSchema,
  IScheduleDocument
} from './definitions/schedules';
import { Model, FilterQuery } from 'mongoose';
import { IModels } from '../connectionResolver';

export interface IFirstScheduleModel extends Model<IScheduleDocument> { }

export const loadFirstScheduleClass = (models: IModels) => {
  class FirstSchedule { }
  scheduleSchema.loadClass(FirstSchedule);
  return scheduleSchema;
}

export interface IScheduleModel extends Model<IScheduleDocument> {
  getLastSchedule(
    contractId: string,
    payDate: Date
  ): Promise<IScheduleDocument>;
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

    /**
     * Get Last Schedule
     */
    public static async getLastSchedule(contractId: string, payDate: Date) {
      return models.Schedules.findOne({
        contractId: contractId,
        payDate: { $lte: payDate }
      }).sort({ payDate: -1, createdAt: -1 }).lean();
    }
  }
  scheduleSchema.loadClass(Schedule);
  return scheduleSchema;
};
