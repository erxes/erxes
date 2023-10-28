import { IContext } from '../../../connectionResolver';
import {
  IYearPlan,
  IYearPlanDocument,
  IYearPlansAddParams
} from '../../../models/definitions/yearPlans';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { MONTHS } from '../../../constants';
import { getProducts } from './utils';

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

    const { products, productIds } = await getProducts(
      subdomain,
      productId,
      productCategoryId
    );

    const latestYearPlans = await models.YearPlans.find({
      departmentId,
      branchId,
      productId: { $in: productIds }
    });

    const latestYearPlansByProductId = {};
    for (const yearPlan of latestYearPlans) {
      latestYearPlansByProductId[yearPlan.productId || ''] = yearPlan;
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
        uom: product.uom,
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
    doc: IYearPlan & { _id: string },
    { models, user }: IContext
  ) => {
    const { _id, ...params } = doc;
    const yearPlan = await models.YearPlans.getYearPlan({ _id });
    return await models.YearPlans.yearPlanEdit(
      _id,
      {
        ...yearPlan,
        ...params
      },
      user
    );
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
