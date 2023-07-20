import { DAYPLAN_STATUS } from '../../../constants';
import {
  getDayPlanValues,
  getLabelsOfDay,
  getProducts,
  getProductsAndParents,
  getPublicLabels
} from './utils';
import { IContext } from '../../../connectionResolver';
import {
  IDayPlan,
  IDayPlanConfirmParams,
  IDayPlanDocument,
  IDayPlansAddParams
} from '../../../models/definitions/dayPlans';
import { IYearPlan } from '../../../models/definitions/yearPlans';
import {
  moduleCheckPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { sendProcessesMessage } from '../../../messageBroker';

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

    const {
      products,
      productIds,
      parentIdsByProductId,
      timePercentsByProdId
    } = await getProductsAndParents(
      subdomain,
      models,
      productId,
      productCategoryId,
      branchId,
      departmentId
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
    })
      .sort({ startTime: 1 })
      .lean();

    const publicLabels = await getPublicLabels({
      models,
      year: date.getFullYear(),
      month: date.getMonth()
    });

    const dayLabels = await getLabelsOfDay(
      models,
      date,
      branchId,
      departmentId
    );

    let docs: IDayPlan[] = [];
    let inserteds: IDayPlanDocument[] = [];
    let counter = 0;
    const now = new Date();

    for (const product of products) {
      const oldDayPlan = oldDayPlansByProductId[product._id];

      if (oldDayPlan) {
        continue;
      }

      const { planCount, values } = await getDayPlanValues({
        date,
        yearPlanByProductId,
        parentIdsByProductId,
        publicLabels,
        dayLabels,
        timePercentsByProdId,
        product,
        timeFrames
      });

      const dayPlanDoc: IDayPlan & any = {
        date,
        departmentId,
        branchId,
        productId: product._id,
        uom: product.uom,
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
    { models, subdomain }: IContext
  ) => {
    const dayPlans = await models.DayPlans.find({ _id: { $in: _ids } }).lean();
    const newDayPlans = dayPlans.filter(dp => dp.statas === DAYPLAN_STATUS.NEW);
    const otherDayPlans = dayPlans.filter(
      dp => dp.statas !== DAYPLAN_STATUS.NEW
    );
    const removeResponse = await sendProcessesMessage({
      subdomain,
      action: 'removeWorks',
      data: { dayPlans: otherDayPlans },
      isRPC: true,
      defaultValue: {}
    });

    const removeIds = [
      ...removeResponse.removedIds,
      ...newDayPlans.map(ndp => ndp._id)
    ];
    const result = await models.DayPlans.dayPlansRemove(removeIds);
    const notRemovedIds = _ids.filter(id => !removeIds.includes(id));
    if (notRemovedIds.length) {
      throw new Error(`count of not removed: ${notRemovedIds.length}`);
    }

    return result;
  },

  dayPlansConfirm: async (
    _root: any,
    doc: IDayPlanConfirmParams,
    { models, subdomain }: IContext
  ) => {
    const {
      date,
      branchId,
      departmentId,
      productCategoryId,
      productId,
      ids
    } = doc;

    const filter: any = { date, branchId, departmentId };

    if (ids.length) {
      filter._id = { $in: ids };
    }

    const { productIds } = await getProducts(
      subdomain,
      productId,
      productCategoryId
    );

    if (productIds.length) {
      filter.productId = { $in: productIds };
    }

    const dayPlans = await models.DayPlans.find(filter).lean();

    await sendProcessesMessage({
      subdomain,
      action: 'createWorks',
      data: { dayPlans, date, branchId, departmentId },
      isRPC: false
    });

    await models.DayPlans.updateMany(
      { _id: { $in: dayPlans.map(d => d._id) } },
      { $set: { status: DAYPLAN_STATUS.SENT } }
    );

    return await models.DayPlans.find(filter).lean();
  }
};

moduleRequireLogin(dayPlansMutations);
moduleCheckPermission(dayPlansMutations, 'manageSalesPlans');

export default dayPlansMutations;
