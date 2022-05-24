import { ICustomField, IUser, IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import {
  ISalesLog,
  ISalesLogDocument,
  salesLogSchema,
  labelSchema,
  ILabel,
  ILabelDocument,
  ITimeframe,
  ITimeframeDocument,
  timeframeSchema,
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
  updateSalesLog(doc: ISalesLogDocument): Promise<ISalesLogDocument>;
  removeSalesLog(_id: string): Promise<ISalesLogDocument>;
}

export const loadSalesLogClass = (models: IModels) => {
  class SalesLog {
    /*
     create SalesLog 
    */
    public static async createSalesLog(doc: ISalesLog, id) {
      return await models.SalesLogs.create({
        ...doc,
        createdBy: id,
        createdAt: new Date()
      });
    }

    /* 
      upDate SalesLog
    */
    public static async updateSalesLog(doc: ISalesLog) {
      const { branchId } = doc;

      return await models.SalesLogs.update(
        { branchId: branchId },
        { $set: doc }
      );
    }

    /* 
      remove SalesLog and DayPlanConfigs with SaleslogId
    */
    public static async removeSalesLog(_id: string) {
      await models.DayPlanConfigs.deleteMany({ saleLogId: _id });

      return await models.SalesLogs.remove({ _id });
    }
  }

  salesLogSchema.loadClass(SalesLog);

  return salesLogSchema;
};

export interface ILabelModel extends Model<ILabelDocument> {
  saveLabels(doc: any): Promise<ILabelDocument[]>;
  removeLabel(_id: string): Promise<ILabelDocument>;
  updateLabel(_id: string): Promise<ILabelDocument>;
}

export const loadLabelClass = (models: IModels) => {
  class Label {
    /*
      Create and update Labels 
    */
    public static async saveLabels(doc) {
      const add = doc.add;
      // await models.DayConfigs.deleteMany();

      const update = doc.update;

      for (const item of update) {
        await models.Labels.updateOne({ _id: item._id }, { $set: { ...item } });
      }

      const label = await models.Labels.insertMany(add);

      return await label;
    }

    /*  
      remove Label
    */
    public static async removeLabel(_id: String) {
      return await models.Labels.remove({ _id: _id });
    }

    /* 
      update Label
    */
    public static async updateLabel(models, doc) {
      const { _id } = doc;

      delete doc._id;

      return await models.Labels.update({ _id: _id }, { $set: doc });
    }
  }

  labelSchema.loadClass(Label);

  return labelSchema;
};

export interface ITimeframeModel extends Model<ITimeframeDocument> {
  saveTimeframes(doc: {
    update: ITimeframeDocument[];
    add: ITimeframe[];
  }): Promise<ITimeframeDocument[]>;
  removeTimeframe(_id: string): Promise<ITimeframeDocument>;
}

export const loadTimeframeClass = (models: IModels) => {
  class Timeframe {
    public static async saveTimeframes(doc) {
      const add = doc.add;

      const update = doc.update;

      for (const item of update) {
        await models.Timeframes.updateOne(
          { _id: item._id },
          { $set: { ...item } }
        );
      }

      const label = await models.Timeframes.insertMany(add);

      return await label;
    }

    public static async removeTimeframe(_id) {
      return await models.Timeframes.remove({ _id: _id });
    }
  }
  timeframeSchema.loadClass(Timeframe);

  return timeframeSchema;
};

export interface IDayPlanConfigModel extends Model<IDayPlanConfigDocument> {
  saveDayPlanConfig(doc: any): Promise<IDayPlanConfigDocument>;
}

export const loadDayPlanConfigClass = (models: IModels) => {
  class DayPlanConfig {
    public static async saveDayPlanConfig(doc) {
      const configs = doc.configs;

      for (const key of Object.keys(configs)) {
        if (!configs[key]._id) {
          await models.DayPlanConfigs.create({
            saleLogId: doc.saleLogId,
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
        saleLogId: doc.saleLogId
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
    public static async saveMonthPlanConfig(doc) {
      const configs = doc.configs;

      for (const key of Object.keys(configs)) {
        if (!configs[key]._id) {
          await models.MonthPlanConfigs.create({
            saleLogId: doc.saleLogId,
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
        saleLogId: doc.saleLogId
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
    public static async saveYearPlanConfig(doc) {
      const configs = doc.configs;

      for (const key of Object.keys(configs)) {
        if (!configs[key]._id) {
          await models.YearPlanConfigs.create({
            saleLogId: doc.saleLogId,
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
        saleLogId: doc.saleLogId
      });
    }
  }

  yearPlanConfigSchema.loadClass(YearPlanConfig);

  return yearPlanConfigSchema;
};
