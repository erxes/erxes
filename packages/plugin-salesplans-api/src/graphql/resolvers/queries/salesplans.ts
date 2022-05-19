import { IContext, IModels } from '../../../connectionResolver';

const salesLogQueries = {
  getLabels: async (_root, { type }: { type: string }, models: IModels) => {
    return await models.Labels.find({ type });
  },

  getSalesLogs: async (_root, _args, { models }: IContext) => {
    return await models.SalesLogs.find({}).lean();
  },

  getTimeframes: async (_root, _args, { models }: IContext) => {
    return await models.Timeframes.find({});
  },

  getDayPlanConfig: async (_root, salesLogId: string, { models }: IContext) => {
    return await models.DayPlanConfigs.find({ salesLogId });
  },

  getMonthPlanConfig: async (
    _root,
    salesLogId: string,
    { models }: IContext
  ) => {
    return await models.MonthPlanConfigs.find({
      salesLogId: salesLogId
    });
  }
};

export default salesLogQueries;
