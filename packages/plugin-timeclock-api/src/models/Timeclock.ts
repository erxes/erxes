import { Model } from 'mongoose';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import {
  ITimeClock,
  ITimeClockDocument,
  IAbsence,
  ISchedule,
  IPayDate,
  IAbsenceDocument,
  IScheduleDocument,
  scheduleSchema,
  timeSchema,
  absenceSchema,
  absenceTypeSchema,
  scheduleShiftSchema,
  IShift,
  IShiftDocument,
  IAbsenceTypeDocument,
  IAbsenceType,
  IPayDateDocument,
  payDateSchema,
  IScheduleConfigDocument,
  IScheduleConfig,
  scheduleConfigSchema
} from './definitions/timeclock';

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
      const timeclock = await models.Timeclocks.findOne({ _id });
      if (!timeclock) {
        throw new Error('Timeclock not found');
      }

      return timeclock;
    }

    // create
    public static async createTimeClock(doc: ITimeClock) {
      return models.Timeclocks.create({
        ...doc
      });
    }
    // update
    public static async updateTimeClock(_id: string, doc: ITimeClock) {
      await models.Timeclocks.updateOne(
        { _id },
        { $set: { ...doc } }
      ).then(err => console.error(err));
    }
    // remove
    public static async removeTimeClock(_id: string) {
      const timeclock = await models.Timeclocks.getTimeClock(_id);
      return models.Timeclocks.deleteOne({ _id });
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

export interface IAbsenceTypeModel extends Model<IAbsenceTypeDocument> {
  getAbsenceType(_id: string): Promise<IAbsenceTypeDocument>;
  createAbsenceType(doc: IAbsenceType): Promise<IAbsenceTypeDocument>;
  updateAbsenceType(
    _id: string,
    doc: IAbsenceType
  ): Promise<IAbsenceTypeDocument>;
  removeAbsenceType(_id: string): void;
}

export const loadAbsenceTypeClass = (models: IModels) => {
  class AbsenceType {
    // get
    public static async getAbsenceType(_id: string) {
      const absencetype = await models.AbsenceTypes.findOne({ _id });
      if (!absencetype) {
        throw new Error('absence type not found');
      }
      return absencetype;
    }

    // create
    public static async createAbsenceType(doc: IAbsenceType) {
      return models.AbsenceTypes.create({
        ...doc
      });
    }
    // update
    public static async updateAbsenceType(_id: string, doc: IAbsenceType) {
      await models.AbsenceTypes.updateOne(
        { _id },
        { $set: { ...doc } }
      ).then(err => console.error(err));
    }
    // remove
    public static async removeAbsenceType(_id: string) {
      const absencetype = await models.AbsenceTypes.getAbsenceType(_id);
      return models.AbsenceTypes.deleteOne({ _id });
    }
  }

  absenceTypeSchema.loadClass(AbsenceType);

  return absenceTypeSchema;
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

export interface IShiftModel extends Model<IShiftDocument> {
  getShift(_id: string): Promise<IShiftDocument>;
  createShift(doc: IShift): Promise<IShiftDocument>;
  updateShift(_id: string, doc: IShift): Promise<IShiftDocument>;
  removeShift(_id: string): void;
}

export const loadShiftClass = (models: IModels) => {
  class Shift {
    // get
    public static async getShift(_id: string) {
      const schedule = await models.Shifts.findOne({ _id });
      if (!schedule) {
        throw new Error('schedule not found');
      }
      return schedule;
    }
    // create
    public static async createShift(doc: IShift) {
      return models.Shifts.create({
        ...doc
      });
    }
    // update
    public static async updateShift(_id: string, doc: IShift) {
      await models.Shifts.updateOne({ _id }, { $set: { ...doc } }).then(err =>
        console.error(err)
      );
    }
    // remove
    public static async removeShift(_id: string) {
      return models.Shifts.deleteOne({ _id });
    }
  }

  scheduleShiftSchema.loadClass(Shift);

  return scheduleShiftSchema;
};

export interface IPayDateModel extends Model<IPayDateDocument> {
  getPayDate(_id: string): Promise<IPayDateDocument>;
  createPayDate(doc: IPayDate): Promise<IPayDateDocument>;
  updatePayDate(_id: string, doc: IPayDate): Promise<IPayDateDocument>;
  removePayDate(_id: string): void;
}

export const loadPayDateClass = (models: IModels) => {
  // tslint:disable-next-line:max-classes-per-file
  class PayDate {
    // get
    public static async getPayDate(_id: string) {
      const payDate = await models.PayDates.findOne({ _id });
      if (!payDate) {
        throw new Error('payDate not found');
      }
      return payDate;
    }
    // create
    public static async createPayDate(doc: IPayDate) {
      return models.PayDates.create({
        ...doc
      });
    }
    // update
    public static async updatePayDate(_id: string, doc: IPayDate) {
      await models.PayDates.updateOne({ _id }, { $set: { ...doc } }).then(err =>
        console.error(err)
      );
    }
    // remove
    public static async removePayDate(_id: string) {
      return models.PayDates.deleteOne({ _id });
    }
  }

  payDateSchema.loadClass(PayDate);

  return payDateSchema;
};
export interface IScheduleConfigModel extends Model<IScheduleConfigDocument> {
  getScheduleConfig(_id: string): Promise<IScheduleConfigDocument>;
  createScheduleConfig(doc: IScheduleConfig): Promise<IScheduleConfigDocument>;
  updateScheduleConfig(
    _id: string,
    doc: IScheduleConfig
  ): Promise<IScheduleConfigDocument>;
  removeScheduleConfig(_id: string): void;
}

export const loadScheduleConfigClass = (models: IModels) => {
  // tslint:disable-next-line:max-classes-per-file
  class ScheduleConfig {
    // get
    public static async getScheduleConfig(_id: string) {
      const scheduleConfig = await models.ScheduleConfigs.findOne({ _id });
      if (!ScheduleConfig) {
        throw new Error('ScheduleConfig not found');
      }
      return scheduleConfig;
    }
    // create
    public static async createScheduleConfig(doc: IScheduleConfig) {
      return models.ScheduleConfigs.create({
        ...doc
      });
    }
    // update
    public static async updateScheduleConfig(
      _id: string,
      doc: IScheduleConfig
    ) {
      await models.ScheduleConfigs.updateOne(
        { _id },
        { $set: { ...doc } }
      ).then(err => console.error(err));
    }
    // remove
    public static async removeScheduleConfig(_id: string) {
      return models.ScheduleConfigs.deleteOne({ _id });
    }
  }

  scheduleConfigSchema.loadClass(ScheduleConfig);

  return scheduleConfigSchema;
};
