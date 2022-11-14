import {
  moduleRequireLogin,
  moduleCheckPermission
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage } from '../../../messageBroker';
import { MONTHS } from '../../../constants';
import {
  IPlanValue,
  IYearPlan,
  IYearPlanDocument
} from '../../../models/definitions/salesplans';
import { IYearPlansAddParams } from '../../../models/definitions/salesplans';

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

  yearPlanEdit: async (
    _root,
    { _id, uomId, values }: { _id: string; uomId?: string; values: IPlanValue },
    { models, user }: IContext
  ) => {
    const yearPlan = await models.YearPlans.getYearPlan({ _id });
    const uom = uomId || yearPlan.uomId;
    return await models.YearPlans.yearPlanEdit(_id, {
      ...yearPlan,
      uomId: uom,
      values
    });
  },
  yearPlansRemove: async (
    _root: any,
    { _ids }: { _ids: string[] },
    { models }: IContext
  ) => {
    return await models.YearPlans.yearPlansRemove(_ids);
  }
};

moduleRequireLogin(yearPlansMutations);
moduleCheckPermission(yearPlansMutations, 'manageSalesPlans');

export default yearPlansMutations;
