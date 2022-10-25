import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  ITimeClock,
  ITimeClockDocument,
  timeSchema
} from './definitions/template';

export interface ITimeModel extends Model<ITimeClockDocument> {
  getTimeClock(_id: string): Promise<ITimeClockDocument>;
  createTimeClock(doc: ITimeClock): Promise<ITimeClockDocument>;
  updateTimeClock(_id: string, doc: ITimeClock): Promise<ITimeClockDocument>;
  removeTimeClock(_id: string): void;
}

export const loadTimeClass = (models: IModels) => {
  class Time {
    // get
    public static async getTimeClock(_id: string) {
      const timeclock = await models.Templates.findOne({ _id });
      if (!timeclock) {
        throw new Error('Timeclock not found');
      }

      return timeclock;
    }

    // create
    public static async createTimeClock(doc: ITimeClock) {
      return models.Templates.create({
        ...doc,
        date: new Date().toDateString()
      });
    }
    // update
    public static async updateTimeClock(_id: string, doc: ITimeClock) {
      await models.Templates.updateOne(
        { _id },
        { $set: { ...doc } }
      ).then(err => console.error(err));
    }
    // remove
    public static async removeTimeClock(_id: string) {
      const timeclock = await models.Templates.getTimeClock(_id);
      return models.Templates.deleteOne({ _id });
    }
  }

  timeSchema.loadClass(Time);

  return timeSchema;
};
