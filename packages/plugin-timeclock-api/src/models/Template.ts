import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  ITimeClock,
  ITimeClockDocument,
  IAbsence,
  ISchedule,
  IAbsenceDocument,
  IScheduleDocument,
  scheduleSchema,
  timeSchema,
  absenceSchema
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
        ...doc
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

export interface IAbsenceModel extends Model<IAbsenceDocument> {
  getAbsence(_id: string): Promise<IAbsenceDocument>;
  createAbsence(doc: IAbsence): Promise<IAbsenceDocument>;
  updateAbsence(_id: string, doc: IAbsence): Promise<IAbsenceDocument>;
  removeAbsence(_id: string): void;
}

export const loadAbsenceClass = (models: IModels) => {
  class Absence {
    // get
    public static async getAbsence(_id: string) {
      const absence = await models.Absences.findOne({ _id });
      if (!absence) {
        throw new Error('absence not found');
      }

      return absence;
    }

    // create
    public static async createAbsence(doc: IAbsence) {
      return models.Absences.create({
        ...doc
      });
    }
    // update
    public static async updateAbsence(_id: string, doc: IAbsence) {
      await models.Absences.updateOne({ _id }, { $set: { ...doc } }).then(err =>
        console.error(err)
      );
    }
    // remove
    public static async removeAbsence(_id: string) {
      const absence = await models.Absences.getAbsence(_id);
      return models.Absences.deleteOne({ _id });
    }
  }

  absenceSchema.loadClass(Absence);

  return absenceSchema;
};

export interface IScheduleModel extends Model<IScheduleDocument> {
  getSchedule(_id: string): Promise<IScheduleDocument>;
  createSchedule(doc: ISchedule): Promise<IScheduleDocument>;
  updateSchedule(_id: string, doc: ISchedule): Promise<IScheduleDocument>;
  removeSchedule(_id: string): void;
}

export const loadScheduleClass = (models: IModels) => {
  class Schedule {
    // get
    public static async getSchedule(_id: string) {
      const schedule = await models.Schedules.findOne({ _id });
      if (!schedule) {
        throw new Error('schedule not found');
      }
      return schedule;
    }
    // create
    public static async createSchedule(doc: ISchedule) {
      return models.Schedules.create({
        ...doc
      });
    }
    // update
    public static async updateSchedule(_id: string, doc: ISchedule) {
      await models.Schedules.updateOne(
        { _id },
        { $set: { ...doc } }
      ).then(err => console.error(err));
    }
    // remove
    public static async removeSchedule(_id: string) {
      return models.Schedules.deleteOne({ _id });
    }
  }

  scheduleSchema.loadClass(Schedule);

  return scheduleSchema;
};
