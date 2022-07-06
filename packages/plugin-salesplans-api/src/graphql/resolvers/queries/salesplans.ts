import { IContext } from '../../../connectionResolver';

const salesLogQueries = {
  labels: async (
    _root: any,
    { type }: { type: string },
    { models }: IContext
  ) => {
    return await models.Labels.find({ type });
  },

  salesLogs: async (
    _root: any,
    { type, status }: { type: string; status: string },
    { models }: IContext
  ) => {
    let query: any = {};

    if (type && type.length !== 0) query.type = type;

    if (status && status.length !== 0) query.status = status;

    return await models.SalesLogs.find(query).lean();
  },

  salesLogDetail: async (
    _root: any,
    { salesLogId }: { salesLogId: string },
    { models }: IContext
  ) => {
    return await models.SalesLogs.findOne({ _id: salesLogId });
  },

  timeframes: async (_root: any, _args: any, { models }: IContext) => {
    return await models.Timeframes.find({});
  },

  dayPlanConfig: async (
    _root: any,
    { salesLogId }: { salesLogId: string },
    { models }: IContext
  ) => {
    return await models.DayPlanConfigs.find({ salesLogId });
  },

  monthPlanConfig: async (
    _root: any,
    { salesLogId }: { salesLogId: string },
    { models }: IContext
  ) => {
    return await models.MonthPlanConfigs.find({ salesLogId });
  },

  yearPlanConfig: async (
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
