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
import { getDayPlanValues, getProducts } from './utils';
import { IYearPlan } from '../../../../../plugin-salesplans-ui/src/plans/types';

const dayPlansMutations = {
  dayPlansAdd: async (
    _root: any,
    doc: IDayPlansAddParams,
    { user, models, subdomain }: IContext
  ) => {
    const { date, departmentId, branchId, productCategoryId, productId } = doc;
    if (!departmentId || !branchId) {
      throw new Error('Must fill departmend and branch');
    }

    if (!productCategoryId && !productId) {
      throw new Error('Must fill product category or product');
    }

    const { products, productIds } = await getProducts(
      subdomain,
      productId,
      productCategoryId
    );

    const oldDayPlans = await models.DayPlans.find({
      date,
      departmentId,
      branchId,
      productId: { $in: productIds }
    });

    const oldDayPlansByProductId = {};
    for (const dayPlan of oldDayPlans) {
      oldDayPlansByProductId[dayPlan.productId || ''] = dayPlan;
    }

    const yearPlans: IYearPlan[] = await models.YearPlans.find({
      year: date.getFullYear(),
      departmentId,
      branchId,
      productId: { $in: productIds }
    }).lean();
    const yearPlanByProductId = {};

    for (const yearPlan of yearPlans) {
      yearPlanByProductId[yearPlan.productId || ''] = yearPlan;
    }

    const timeFrames = await models.Timeframes.find({
      status: { $ne: 'deleted' }
    }).lean();

    let docs: IDayPlan[] = [];
    let inserteds: IDayPlanDocument[] = [];
    let counter = 0;
    const now = new Date();

    for (const product of products) {
      const oldDayPlan = oldDayPlansByProductId[product._id];

      if (oldDayPlan) {
        continue;
      }

      const { planCount, values } = await getDayPlanValues(
        models,
        doc,
        yearPlanByProductId,
        product,
        timeFrames
      );

      const dayPlanDoc: IDayPlan & any = {
        date,
        departmentId,
        branchId,
        productId: product._id,
        uomId: product.uomId,
        planCount,
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
