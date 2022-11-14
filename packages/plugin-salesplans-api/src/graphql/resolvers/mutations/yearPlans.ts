import {
  moduleRequireLogin,
  moduleCheckPermission
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import {
  sendProcessesMessage,
  sendProductsMessage
} from '../../../messageBroker';
import { STATUS, MONTHS } from '../../../constants';
import {
  IYearPlan,
  IYearPlanDocument
} from '../../../models/definitions/salesplans';
import {
  ISalesLogDocument,
  ISalesLogProduct,
  IYearPlansAddParams
} from '../../../models/definitions/salesplans';

const yearPlansMutations = {
  yearPlansAdd: async (
    _root: any,
    doc: IYearPlansAddParams,
    { user, models, subdomain }: IContext
  ) => {
    const { year, departmentId, branchId, productCategoryId, productId } = doc;
    if (!departmentId || !branchId) {
      throw new Error('Must fill departmend and branch');
    }

    if (!productCategoryId && !productId) {
      throw new Error('Must fill product category or product');
    }

    let products: any[] = [];
    if (productId) {
      const product = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: { _id: productId },
        isRPC: true
      });
      products = [product];
    }

    if (productCategoryId) {
      const limit = await sendProductsMessage({
        subdomain,
        action: 'count',
        data: {
          query: { status: { $nin: ['archived', 'deleted'] } },
          categoryId: productCategoryId
        },
        isRPC: true,
        defaultValue: 0
      });

      products = await sendProductsMessage({
        subdomain,
        action: 'find',
        data: {
          query: { status: { $nin: ['archived', 'deleted'] } },
          categoryId: productCategoryId,
          limit,
          sort: { code: 1 }
        },
        isRPC: true,
        defaultValue: []
      });
    }

    const productIds = products.map(p => p._id);

    const latestYearPlans = await models.YearPlans.find({
      departmentId,
      branchId,
      productId: { $in: productIds }
    });

    const latestYearPlansByProductId = {};
    for (const yearPlan of latestYearPlans) {
      latestYearPlansByProductId[yearPlan.productId] = yearPlan;
    }

    let docs: IYearPlan[] = [];
    let inserteds: IYearPlanDocument[] = [];
    let counter = 0;
    const now = new Date();

    for (const product of products) {
      const latestYearPlan = latestYearPlansByProductId[product._id];
      let values = {};

      if (latestYearPlan) {
        if (latestYearPlan.year === year) {
          continue;
        }

        values = latestYearPlan.values;
      } else {
        MONTHS.map(m => (values[m] = 0));
      }

      const yearPlanDoc: IYearPlan & any = {
        year,
        departmentId,
        branchId,
        productId: product._id,
        uomId: product.uomId,
        values,
        createdAt: now,
        modifiedAt: now,
        createdBy: user._id,
        modifiedBy: user._id
      };

      docs.push(yearPlanDoc);
      counter += 1;

      if (counter > 100) {
        console.log(docs);
        const inserted = await models.YearPlans.insertMany(docs);
        inserteds = inserteds.concat(inserted);
        docs = [];
      }
    }

    if (docs.length) {
      const inserted = await models.YearPlans.insertMany(docs);
      inserteds = inserteds.concat(inserted);
    }
    return inserteds;
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

    if (result && doc.status === STATUS.PENDING) {
      let worksIntervals: any = [];

      /**
       * Converts all the intervals into a format that allows process plugin to read
       */
      result.products.map((product: any) => {
        const { intervals = [] } = product;

        intervals.map((interval: any) => {
          worksIntervals.push({
            productId: product.productId,
            label: interval.label,
            count: interval.value
          });
        });
      });

      /**
       * Sends the data to plugin-processes-api
       */
      const messageResult = await sendProcessesMessage({
        subdomain,
        action: 'createWorks',
        data: {
          salesLogId: result._id,
          date: result.date,
          branchId: result.branchId,
          departmentId: result.departmentId,
          intervalId: 'intervalId',
          interval: { intervals: worksIntervals }
        },
        isRPC: false
      });

      console.log(messageResult);
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

moduleRequireLogin(yearPlansMutations);
moduleCheckPermission(yearPlansMutations, 'manageSalesPlans');

export default yearPlansMutations;
