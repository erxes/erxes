import { IContext } from '../../../connectionResolver';
import {
  IDayPlan,
  IDayPlanDocument,
  IDayPlansAddParams
} from '../../../models/definitions/dayPlans';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { MONTHS } from '../../../constants';
import { sendProductsMessage } from '../../../messageBroker';

const dayPlansMutations = {
  dayPlansAdd: async (
    _root: any,
    doc: IDayPlansAddParams,
    { user, models, subdomain }: IContext
  ) => {
    console.log(doc, 'ddddddddddddddd');
    const { date, departmentId, branchId, productCategoryId, productId } = doc;
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

    const latestDayPlans = await models.DayPlans.find({
      departmentId,
      branchId,
      productId: { $in: productIds }
    });

    const latestDayPlansByProductId = {};
    for (const dayPlan of latestDayPlans) {
      latestDayPlansByProductId[dayPlan.productId || ''] = dayPlan;
    }

    let docs: IDayPlan[] = [];
    let inserteds: IDayPlanDocument[] = [];
    let counter = 0;
    const now = new Date();

    for (const product of products) {
      const latestDayPlan = latestDayPlansByProductId[product._id];
      let values = {};

      if (latestDayPlan) {
        if (latestDayPlan.date === date) {
          continue;
        }

        values = latestDayPlan.values;
      } else {
        MONTHS.map(m => (values[m] = 0));
      }

      const dayPlanDoc: IDayPlan & any = {
        date,
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

      docs.push(dayPlanDoc);
      counter += 1;

      if (counter > 100) {
        const inserted = await models.DayPlans.insertMany(docs);
        inserteds = inserteds.concat(inserted);
        docs = [];
      }
    }

    if (docs.length) {
      const inserted = await models.DayPlans.insertMany(docs);
      inserteds = inserteds.concat(inserted);
    }
    return inserteds;
  },

  dayPlanEdit: async (
    _root,
    doc: IDayPlan & { _id: string },
    { models, user }: IContext
  ) => {
    const { _id, ...params } = doc;
    const dayPlan = await models.DayPlans.getDayPlan({ _id });
    return await models.DayPlans.dayPlanEdit(
      _id,
      {
        ...dayPlan,
        ...params
      },
      user
    );
  },
  dayPlansRemove: async (
    _root: any,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) => {
    return await models.DayPlans.dayPlansRemove(_ids);
  }
};

moduleRequireLogin(dayPlansMutations);
moduleCheckPermission(dayPlansMutations, 'manageSalesPlans');

export default dayPlansMutations;
