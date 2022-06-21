import { IContext } from '../../../connectionResolver';

const salesLogQueries = {
  getLabels: async (
    _root: any,
    { type }: { type: string },
    { models }: IContext
  ) => {
    return await models.Labels.find({ type });
  },

  getSalesLogs: async (_root: any, _args: any, { models }: IContext) => {
    return await models.SalesLogs.find({}).lean();
  },

  getSalesLogDetail: async (
    _root: any,
    { salesLogId }: { salesLogId: string },
    { models }: IContext
  ) => {
    return await models.SalesLogs.findOne({ _id: salesLogId });
  },

  getTimeframes: async (_root: any, _args: any, { models }: IContext) => {
    return await models.Timeframes.find({});
  },

  getDayPlanConfig: async (
    _root: any,
    { salesLogId }: { salesLogId: string },
    { models }: IContext
  ) => {
    return await models.DayPlanConfigs.find({ salesLogId });
  },

  getMonthPlanConfig: async (
    _root: any,
    { salesLogId }: { salesLogId: string },
    { models }: IContext
  ) => {
    return await models.MonthPlanConfigs.find({ salesLogId });
  },

  getYearPlanConfig: async (
    _root: any,
    { salesLogId }: { salesLogId: string },
    { models }: IContext
  ) => {
    return await models.YearPlanConfigs.find({
      salesLogId
    });
  }
};

export default salesLogQueries;
