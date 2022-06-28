import { IContext, models } from '../../../connectionResolver';
import { sendProcessesMessage } from '../../../messageBroker';
import { STATUS } from '../../../constants';
import {
  ISalesLog,
  ISalesLogDocument,
  ISalesLogProduct
} from '../../../models/definitions/salesplans';

const salesLogMutations = {
  salesLogAdd: async (
    _root: any,
    doc: ISalesLog,
    { user, models }: IContext
  ) => {
    return await models.SalesLogs.salesLogAdd(doc, user._id);
  },

  salesLogEdit: async (
    _root: any,
    doc: ISalesLogDocument,
    { models }: IContext
  ) => {
    return await models.SalesLogs.salesLogEdit(doc._id, doc);
  },

  salesLogRemove: async (_root: any, _id: string, { models }: IContext) => {
    return await models.SalesLogs.salesLogRemove(_id);
  },

  salesLogProductUpdate: async (
    _root: any,
    doc: { _id: string; data: ISalesLogProduct },
    { models }: IContext
  ) => {
    return await models.SalesLogs.salesLogProductUpdate(doc._id, doc.data);
  },

  salesLogProductRemove: async (
    _root: any,
    doc: { _id: string; productId: string },
    { models }: IContext
  ) => {
    return await models.SalesLogs.salesLogProductRemove(doc._id, doc.productId);
  },

  salesLogStatusUpdate: async (
    _root: any,
    doc: { _id: string; status: string },
    { models, subdomain }: IContext
  ) => {
    const result = await models.SalesLogs.salesLogStatusUpdate(
      doc._id,
      doc.status
    );

    if (result && ![STATUS.PUBLISHED, STATUS.PENDING].includes(result.status)) {
      let intervals: any = [];

      result.products.map((item: any) => {
        intervals.push({
          productId: item.productId,
          label: item.label,
          count: item.label
        });
      });

      await sendProcessesMessage({
        subdomain,
        action: 'createWorks',
        data: {
          salesLogId: result._id,
          data: result.date,
          branchId: result.branchId,
          departmentId: result.departmentId,
          interval: intervals
        },
        isRPC: false
      });
    }

    return result;
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
