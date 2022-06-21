import { ICustomField, IUser, IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ISalesLog,
  ISalesLogDocument,
  salesLogSchema,
  IDayPlanConfig,
  IDayPlanConfigDocument,
  dayPlanConfigSchema,
  IMonthPlanConfig,
  IMonthPlanConfigDocument,
  monthPlanConfigSchema,
  IYearPlanConfig,
  IYearPlanConfigDocument,
  yearPlanConfigSchema
} from './definitions/salesplans';

export interface ISalesLogModel extends Model<ISalesLogDocument> {
  createSalesLog(doc: ISalesLog, id: string): Promise<ISalesLogDocument>;
  updateSalesLog(
    doc: ISalesLogDocument,
    id: string
  ): Promise<ISalesLogDocument>;
  removeSalesLog(_id: string): Promise<JSON>;
}

export const loadSalesLogClass = (models: IModels) => {
  class SalesLog {
    /*
     create SalesLog 
    */
    public static async createSalesLog(doc: ISalesLog, userId: String) {
      return await models.SalesLogs.create({
        ...doc,
        createdBy: userId,
        createdAt: new Date()
      });
    }

    /* 
      update SalesLog
    */
    public static async updateSalesLog(doc: ISalesLogDocument, _id: String) {
      const result = await models.SalesLogs.updateOne({ _id }, { $set: doc });

      console.log(result, doc);

      return models.SalesLogs.findOne({ _id });
    }

    /* 
      remove SalesLog and DayPlanConfigs with SaleslogId
    */
    public static async removeSalesLog(_id: string) {
      await models.DayPlanConfigs.deleteMany({ salesLogId: _id });

      await models.MonthPlanConfigs.deleteMany({ salesLogId: _id });

      await models.YearPlanConfigs.deleteMany({ salesLogId: _id });

      return await models.SalesLogs.remove({ _id });
    }
  }

  salesLogSchema.loadClass(SalesLog);

  return salesLogSchema;
};

export interface IDayPlanConfigModel extends Model<IDayPlanConfigDocument> {
  saveDayPlanConfig(doc: any): Promise<IDayPlanConfigDocument>;
}

export const loadDayPlanConfigClass = (models: IModels) => {
  class DayPlanConfig {
    public static async saveDayPlanConfig({ doc }) {
      const configs = doc.data;

      for (const key of Object.keys(configs)) {
        if (!configs[key]._id) {
          await models.DayPlanConfigs.create({
            salesLogId: doc.salesLogId,
            timeframeId: key,
            labelIds: configs[key].data
          });
        } else {
          await models.DayPlanConfigs.updateOne(
            { _id: configs[key]._id },
            { $set: { labelIds: configs[key].data } }
          );
        }
      }

      return await models.DayPlanConfigs.find({
        salesLogId: doc.salesLogId
      });
    }
  }

  dayPlanConfigSchema.loadClass(DayPlanConfig);

  return dayPlanConfigSchema;
};

export interface IMonthPlanConfigModel extends Model<IMonthPlanConfigDocument> {
  saveMonthPlanConfig(doc: any): Promise<IMonthPlanConfigDocument>;
}

export const loadMonthPlanConfigClass = (models: IModels) => {
  class MonthPlanConfig {
    public static async saveMonthPlanConfig({ doc }) {
      const configs = doc.data;
      for (const key of Object.keys(configs)) {
        if (!configs[key]._id) {
          await models.MonthPlanConfigs.create({
            salesLogId: doc.salesLogId,
            day: key,
            labelIds: configs[key].data
          });
        } else {
          await models.MonthPlanConfigs.updateOne(
            { _id: configs[key]._id },
            { $set: { labelIds: configs[key].data } }
          );
        }
      }

      return await models.MonthPlanConfigs.find({
        salesLogId: doc.salesLogId
      });
    }
  }

  monthPlanConfigSchema.loadClass(MonthPlanConfig);

  return monthPlanConfigSchema;
};

export interface IYearPlanConfigModel extends Model<IYearPlanConfigDocument> {
  saveYearPlanConfig(doc: any): Promise<IYearPlanConfigDocument>;
}

export const loadYearPlanConfigClass = (models: IModels) => {
  class YearPlanConfig {
    public static async saveYearPlanConfig({ doc }) {
      const configs = doc.data;

      for (const key of Object.keys(configs)) {
        if (!configs[key]._id) {
          await models.YearPlanConfigs.create({
            salesLogId: doc.salesLogId,
            month: key,
            labelIds: configs[key].data
          });
        } else {
          await models.YearPlanConfigs.updateOne(
            { _id: configs[key]._id },
            { $set: { labelIds: configs[key].data } }
          );
        }
      }

      return await models.YearPlanConfigs.find({
        salesLogId: doc.salesLogId
      });
    }
  }

  yearPlanConfigSchema.loadClass(YearPlanConfig);

  return yearPlanConfigSchema;
};
