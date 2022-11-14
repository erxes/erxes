import { ICustomField, IUser, IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { STATUS } from '../constants';
import {
  dayPlanSchema,
  IDayPlan,
  IDayPlanDocument,
  IYearPlan,
  IYearPlanDocument,
  IYearPlansAddParams,
  yearPlanSchema
} from './definitions/salesplans';
import { sendProductsMessage } from '../../../plugin-processes-api/src/messageBroker';
import {
  ISalesLog,
  ISalesLogDocument,
  ISalesLogProduct,
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
  salesLogAdd(doc: ISalesLog, userId: string): Promise<ISalesLogDocument>;
  salesLogEdit(_id: string, doc: ISalesLogDocument): Promise<ISalesLogDocument>;
  salesLogRemove(_id: string): Promise<JSON>;
  salesLogProductUpdate(_id: string, data: ISalesLogProduct): Promise<JSON>;
  salesLogProductRemove(_id: string, productId: string): Promise<JSON>;
  salesLogStatusUpdate(_id: string, status: string): Promise<ISalesLogDocument>;
}

export const loadSalesLogClass = (models: IModels) => {
  class SalesLog {
    /*
     create SalesLog
    */
    public static async salesLogAdd(data: ISalesLog, userId: String) {
      return await models.SalesLogs.create({
        ...data,
        createdBy: userId,
        createdAt: new Date()
      });
    }

    /*
      update SalesLog
    */
    public static async salesLogEdit(_id: String, data: ISalesLogDocument) {
      const result = await models.SalesLogs.findOne({ _id });

      if (result && [STATUS.PUBLISHED, STATUS.PENDING].includes(result.status))
        return new Error(`Published log can't be altered`);

      await models.SalesLogs.updateOne({ _id }, { $set: data });

      return await models.SalesLogs.findOne({ _id });
    }

    /*
      remove SalesLog and DayPlanConfigs with SaleslogId
    */
    public static async salesLogRemove(_id: string) {
      const result = await models.SalesLogs.findOne({ _id });

      if (result && [STATUS.PUBLISHED, STATUS.PENDING].includes(result.status))
        return new Error(`Published log can't be altered`);

      await models.DayPlanConfigs.deleteMany({ salesLogId: _id });
      await models.MonthPlanConfigs.deleteMany({ salesLogId: _id });
      await models.YearPlanConfigs.deleteMany({ salesLogId: _id });

      return await models.SalesLogs.deleteOne({ _id });
    }

    public static async salesLogProductUpdate(
      _id: string,
      data: ISalesLogProduct
    ) {
      const result = await models.SalesLogs.findOne({
        _id,
        'products.productId': data.productId
      });

      if (result && [STATUS.PUBLISHED, STATUS.PENDING].includes(result.status))
        return new Error(`Published log can't be altered`);

      if (!result)
        return await models.SalesLogs.updateOne(
          { _id },
          { $push: { products: data } }
        );
      else
        return await models.SalesLogs.updateOne(
          { _id, 'products.productId': data.productId },
          { $set: { 'products.$.intervals': data.intervals } }
        );
    }

    public static async salesLogProductRemove(_id: string, productId: string) {
      const result = await models.SalesLogs.findOne({ _id });

      if (result && [STATUS.PUBLISHED, STATUS.PENDING].includes(result.status))
        return new Error(`Published log can't be altered`);

      return await models.SalesLogs.updateOne(
        { _id },
        { $pull: { products: { productId } } }
      );
    }

    public static async salesLogStatusUpdate(_id: string, status: string) {
      const result = await models.SalesLogs.findOne({ _id });

      if (result && result.status !== STATUS.PUBLISHED)
        await models.SalesLogs.updateOne({ _id }, { $set: { status: status } });

      return await models.SalesLogs.findOne({ _id }).lean();
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

export interface IYearPlanModel extends Model<IYearPlanDocument> {
  yearPlanAdd(doc: IYearPlan): Promise<IYearPlanDocument>;
  yearPlanEdit(_id: string, doc: IYearPlan): Promise<IYearPlanDocument>;
  yearPlansRemove(_ids: string[]): Promise<JSON>;
  yearPlansPublish(_ids: string[]): Promise<IYearPlanDocument[]>;
}
export const loadYearPlanClass = (models: IModels) => {
  class YearPlan {
    public static async yearPlanAdd(doc: IYearPlan) {
      return models.YearPlans.create({ ...doc });
    }

    public static async yearPlanEdit(_id: string, doc: IYearPlan) {
      return await models.YearPlans.updateOne({ _id }, { $set: { ...doc } });
    }

    public static async yearPlansRemove(_ids: string[]) {
      return await models.YearPlans.deleteMany({ _id: { $in: _ids } });
    }

    public static async yearPlansPublish(_ids: string[]) {
      return await models.YearPlans.updateMany(
        { _id: { $in: _ids } },
        {
          $set: {
            status: 'publish',
            confirmedData: {
              date: new Date(),
              values: '$values'
            }
          }
        }
      );
    }
  }

  yearPlanSchema.loadClass(YearPlan);

  return yearPlanSchema;
};

export interface IDayPlanModel extends Model<IDayPlanDocument> {
  dayPlanAdd(doc: IDayPlan): Promise<IDayPlanDocument>;
  dayPlanEdit(_id: string, doc: IDayPlan): Promise<IDayPlanDocument>;
  dayPlanRemove(_ids: string[]): Promise<JSON>;
  dayPlansPublish(_ids: string[]): Promise<IDayPlanDocument[]>;
}
export const loadDayPlanClass = (models: IModels) => {
  class DayPlan {
    public static async dayPlansAdd(doc: IDayPlan) {
      return models.DayPlans.create({ ...doc });
    }

    public static async dayPlansEdit(_id: string, doc: IDayPlan) {
      return await models.DayPlans.updateOne({ _id }, { $set: { ...doc } });
    }

    public static async dayPlansRemove(_ids: string[]) {
      return await models.DayPlans.deleteMany({ _id: { $in: _ids } });
    }

    public static async dayPlansPublish(_ids: string[]) {
      return await models.DayPlans.updateMany(
        { _id: { $in: _ids } },
        {
          $set: {
            status: 'publish'
          }
        }
      );
    }
  }

  dayPlanSchema.loadClass(DayPlan);

  return dayPlanSchema;
};
