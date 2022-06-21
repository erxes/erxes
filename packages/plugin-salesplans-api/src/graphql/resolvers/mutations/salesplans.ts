import { IContext } from '../../../connectionResolver';
import {
  ISalesLog,
  ISalesLogDocument
} from '../../../models/definitions/salesplans';

const salesLogMutations = {
  createSalesLog: async (
    _root: any,
    doc: ISalesLog,
    { user, models }: IContext
  ) => {
    return await models.SalesLogs.createSalesLog(doc, user._id);
  },

  updateSalesLog: async (
    _root: any,
    doc: ISalesLogDocument,
    { models }: IContext
  ) => {
    return await models.SalesLogs.updateSalesLog(doc, doc._id);
  },

  removeSalesLog: async (_root: any, _id: string, { models }: IContext) => {
    return await models.SalesLogs.removeSalesLog(_id);
  },

  saveDayPlanConfig: async (
    _root: any,
    doc: { salesLogId: string; data: JSON },
    { models }: IContext
  ) => {
    return await models.DayPlanConfigs.saveDayPlanConfig({ doc });
  },

  saveMonthPlanConfig: async (
    _root: any,
    doc: { salesLogId: string; date: Date; data: JSON },
    { models }: IContext
  ) => {
    return await models.MonthPlanConfigs.saveMonthPlanConfig({ doc });
  },

  saveYearPlanConfig: async (
    _root: any,
    doc: { salesLogId: string; data: JSON },
    { models }: IContext
  ) => {
    return await models.YearPlanConfigs.saveYearPlanConfig({ doc });
  }
};

export default salesLogMutations;
