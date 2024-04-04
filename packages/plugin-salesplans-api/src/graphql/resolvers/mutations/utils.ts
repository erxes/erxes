import { IModels } from '../../../connectionResolver';
import { MONTH_NUMBERS } from '../../../constants';
import { sendProductsMessage } from '../../../messageBroker';
import { ILabelDocument } from '../../../models/definitions/labels';
import { IDayLabelDocument } from '../../../models/definitions/dayLabels';
import { getPureDate } from '@erxes/api-utils/src/core';

const getParentsOrders = order => {
  const orders: string[] = [];
  const splitOrders = order.split('/');
  let currentOrder = '';

  for (const oStr of splitOrders) {
    if (oStr) {
      currentOrder = `${currentOrder}${oStr}/`;
      orders.push(currentOrder);
    }
  }

  return orders;
};

export const getParentCategories = async (
  subdomain: string,
  productId: string,
  productCategoryId: string
) => {
  let categoryId = productCategoryId;

  if (productId) {
    const product = await sendProductsMessage({
      subdomain,
      action: 'findOne',
      data: { _id: productId },
      isRPC: true
    });

    categoryId = product.categoryId;
  }

  const category = await sendProductsMessage({
    subdomain,
    action: 'categories.findOne',
    data: { _id: categoryId },
    isRPC: true
  });

  if (!category) {
    throw new Error('not found category');
  }

  const orders = getParentsOrders(category.order);

  const categories = await sendProductsMessage({
    subdomain,
    action: 'categories.find',
    data: {
      query: {
        $or: [{ order: { $in: orders } }, { order: { $regex: category.order } }]
      },
      sort: { order: 1 }
    },
    isRPC: true
  });

  return categories;
};

export const getProducts = async (
  subdomain: string,
  productId: string,
  productCategoryId: string
) => {
  let products: any[] = [];

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

  if (productId) {
    products = await sendProductsMessage({
      subdomain,
      action: 'find',
      data: { query: { _id: productId } },
      isRPC: true,
      defaultValue: []
    });
  }

  const productIds = products.map(p => p._id);

  return { products, productIds };
};

export const getProductsAndParents = async (
  subdomain: string,
  models: IModels,
  productId: string,
  productCategoryId: string,
  branchId: string,
  departmentId: string
) => {
  const parentIdsByProdId = {};
  const timePercentsByProdId = {};

  const categories = await getParentCategories(
    subdomain,
    productId,
    productCategoryId
  );

  const { products, productIds } = await getProducts(
    subdomain,
    productId,
    productCategoryId
  );

  const categoryById = {};
  for (const cat of categories) {
    categoryById[cat._id] = cat;
  }

  const specTimeFrames = await models.TimeProportions.find({
    branchId,
    departmentId,
    productCategoryId: { $in: categories.map(c => c._id) }
  }).lean();

  for (const product of products) {
    const category = categoryById[product.categoryId];

    const orders = getParentsOrders(category.order);

    if (!Object.keys(parentIdsByProdId).includes(product._id)) {
      parentIdsByProdId[product._id] = [];
    }

    parentIdsByProdId[product._id] = parentIdsByProdId[product._id].concat(
      categories.filter(c => orders.includes(c.order)).map(c => c._id)
    );
  }

  for (const product of products) {
    const parentIds = parentIdsByProdId[product._id];
    const productOfspecs = specTimeFrames.filter(tf =>
      parentIds.includes(tf.productCategoryId)
    );

    if (!productOfspecs.length) {
      continue;
    }

    timePercentsByProdId[product._id] = productOfspecs[0];

    for (const specTimeFrame of productOfspecs) {
      // to specialize, latest ordered category
      if (
        !String(
          categoryById[timePercentsByProdId[product._id].productCategoryId]
            .order
        ).localeCompare(
          String(categoryById[specTimeFrame.productCategoryId].order)
        )
      ) {
        timePercentsByProdId[product._id] = specTimeFrame;
      }
    }
  }

  return {
    products,
    productIds,
    parentIdsByProductId: parentIdsByProdId,
    timePercentsByProdId
  };
};

export const getPublicLabels = async ({
  models,
  year,
  month
}: {
  models: IModels;
  year: number;
  month: number;
}) => {
  const dayInMonth = new Date(year, month, 0).getDate();

  const publicLabels: ILabelDocument[] = await models.Labels.find({
    effect: 'public'
  }).lean();

  const rulesByLabelId = {};
  for (const label of publicLabels) {
    rulesByLabelId[label._id] = label.rules;
  }

  const publicLabelIds = publicLabels.map(pl => pl._id);

  const dayLabelsOfMonth = await models.DayLabels.find({
    date: {
      $gte: new Date(year, month, 1),
      $lte: new Date(year, month, dayInMonth, 23, 59, 59)
    },
    labelIds: { $in: publicLabelIds }
  }).lean();

  for (const dl of dayLabelsOfMonth) {
    dl.labels = publicLabels.filter(pl => dl.labelIds.includes(pl._id));
  }

  return dayLabelsOfMonth;
};

export const getLabelsOfDay = async (
  models: IModels,
  date,
  branchId,
  departmentId
) => {
  const dayLabel = await models.DayLabels.findOne({
    date,
    departmentId,
    branchId
  }).lean();

  if (!dayLabel) {
    return [];
  }

  const labelIds = dayLabel.labelIds;

  if (!labelIds.length) {
    return [];
  }

  return await models.Labels.find({ _id: { $in: labelIds } });
};

const getDivederInMonth = async (
  product,
  parentIdsByProductId,
  publicLabels: (IDayLabelDocument & { labels: ILabelDocument[] })[],
  year: number,
  month: number
) => {
  const dayInMonth = new Date(year, month, 0).getDate();
  let divider = dayInMonth;

  for (const dayLabel of publicLabels) {
    const categoryIds = parentIdsByProductId[product._id] || [];
    for (const perLabel of dayLabel.labels) {
      const publicRules = (perLabel.rules || []).filter(rule =>
        categoryIds.includes(rule.productCategoryId)
      );

      if (publicRules && publicRules.length) {
        const lastPublicRule = publicRules[publicRules.length - 1];
        publicRules.map(r => r.multiplier || 0);
        divider += (lastPublicRule.multiplier || 1) - 1;
      }
    }
  }

  return divider;
};

const getMultiplier = async (product, parentIdsByProductId, dayLabels) => {
  let multiplier = 1;
  const categoryIds = parentIdsByProductId[product._id] || [];

  for (const perLabel of dayLabels) {
    const rules = (perLabel.rules || []).filter(rule =>
      categoryIds.includes(rule.productCategoryId)
    );

    if (rules && rules.length) {
      multiplier *= rules
        .map(r => r.multiplier || 0)
        .reduce((sum, cur) => sum * cur);
    }
  }

  return multiplier;
};

export const getDayPlanValues = async ({
  date,
  yearPlanByProductId,
  parentIdsByProductId,
  publicLabels,
  dayLabels,
  timePercentsByProdId,
  product,
  timeFrames
}: {
  date: Date;
  yearPlanByProductId;
  parentIdsByProductId;
  publicLabels;
  dayLabels;
  timePercentsByProdId;
  product;
  timeFrames;
}) => {
  let values: any = [];
  const yearPlan = yearPlanByProductId[product._id];

  if (!yearPlan) {
    return { planCount: 0, values: [] };
  }

  const pureDate = getPureDate(date, -1);

  const month = pureDate.getMonth() + 1;
  const key = MONTH_NUMBERS[month];

  const monthPlanCount = Number(yearPlan.values[key]) || 0;

  const daysInMonth = await getDivederInMonth(
    product,
    parentIdsByProductId,
    publicLabels,
    pureDate.getFullYear(),
    pureDate.getMonth() + 1
  );

  const dayPlanCount = monthPlanCount / daysInMonth;

  const multiplier = await getMultiplier(
    product,
    parentIdsByProductId,
    dayLabels
  );

  const dayCalcedCount = dayPlanCount * multiplier;

  let percents = timeFrames.map(tf => ({
    _id: tf._id,
    timeId: tf._id,
    percent: tf.percent
  }));
  const timePercent = timePercentsByProdId[product._id];
  if (timePercent) {
    percents = timePercent.percents;
  }

  const sumPercent = (percents || [])
    .map(p => p.percent || 0)
    .reduce((sum, d) => sum + d);

  let planCount = 0;
  for (const timeFrame of percents) {
    const count = Math.round(
      (dayCalcedCount / sumPercent) * (timeFrame.percent || 1)
    );
    values.push({
      timeId: timeFrame.timeId,
      count
    });
    planCount += count;
  }

  return { planCount, values };
};
