import { IContext, IModels } from '../../../connectionResolver';
import {
  ILabel,
  ILabelDocument,
  ISalesLog,
  ITimeframe,
  ITimeframeDocument
} from '../../../models/definitions/salesplans';

const salesLogMutations = {
  createSalesLog: async (_root, doc: ISalesLog, { user, models }: IContext) => {
    return await models.SalesLogs.createSalesLog(doc, user._id);
  },

  saveLabels: async (
    _root,
    doc: { update: ILabelDocument[]; add: ILabel[] },
    { models }: IContext
  ) => {
    console.log('adsfsdfsdf', doc.add);
    return await models.Labels.saveLabels(doc);
  },

  saveTimeframes: async (
    _root,
    doc: { update: ITimeframeDocument[]; add: ITimeframe[] },
    { models }: IContext
  ) => {
    return await models.Timeframes.saveTimeframes(doc);
  },

  saveDayPlanConfig: async (
    _root,
    doc: { salesLogId: string; data: JSON },
    { models }: IContext
  ) => {
    return await models.DayPlanConfigs.saveDayPlanConfig(doc);
  },

  saveMonthPlanConfig: async (
    _root,
    doc: { salesLogId: string; date: Date; data: JSON },
    { models }: IContext
  ) => {
    console.log('wuuuuuut', doc);
    return await models.MonthPlanConfigs.saveMonthPlanConfig({ doc });
  },

  removeLabel: async (
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.Labels.removeLabel(_id);
  },

  removeTimeframe: async (_root, _id: string, { models }: IContext) => {
    return await models.Timeframes.removeTimeframe(_id);
  },

  removeSalesLog: async (_root, _id: string, { models }: IContext) => {
    return await models.SalesLogs.removeSalesLog(_id);
  }
};

export default salesLogMutations;
