import { IModels } from '../../../connectionResolver';
import { MONTHS, MONTH_NUMBERS } from '../../../constants';
import { sendProductsMessage } from '../../../messageBroker';

export const getProducts = async (subdomain, productId, productCategoryId) => {
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

  return { products, productIds };
};

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

const getMultiplier = async (models, date, departmentId, branchId) => {
  const dayLabel = await models.DayLabels.findOne({
    date,
    departmentId,
    branchId
  }).lean();

  if (!dayLabel) {
    return 1;
  }

  const labelIds = dayLabel.labelIds;

  if (!labelIds.length) {
    return 1;
  }

  const labels = await models.Labels.find({ _id: { $in: labelIds } });

  if (!labels.length) {
    return 1;
  }

  const multiplier = labels.map(l => l.multiplier).reduce((a, b) => a * b);

  return multiplier;
};

export const getDayPlanValues = async (
  models: IModels,
  doc,
  yearPlanByProductId,
  product,
  timeFrames
) => {
  const { date, departmentId, branchId } = doc;
  let values: any = [];
  const yearPlan = yearPlanByProductId[product._id];

  if (!yearPlan) {
    return { planCount: 0, values: [] };
  }

  const month = date.getMonth() + 1;
  const key = MONTH_NUMBERS[month];

  const monthPlanCount = Number(yearPlan.values[key]) || 0;

  const daysInMonth = getDaysInMonth(date.getFullYear(), date.getMonth() + 1);

  const dayPlanCount = monthPlanCount / daysInMonth;

  const multiplier = await getMultiplier(models, date, departmentId, branchId);

  const dayCalcedCount = dayPlanCount * multiplier;

  const sumPercent = timeFrames
    .map(d => d.percent || 0)
    .reduce((sum, d) => sum + d);

  let planCount = 0;
  for (const timeFrame of timeFrames) {
    const count = Math.round(
      (dayCalcedCount / sumPercent) * (timeFrame.percent || 1)
    );
    values.push({
      timeId: timeFrame._id,
      count
    });
    planCount += count;
  }

  return { planCount, values };
};
