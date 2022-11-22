import { IModels } from '../../../connectionResolver';
import { MONTH_NUMBERS } from '../../../constants';
import { sendProductsMessage } from '../../../messageBroker';
import { ILabelDocument } from '../../../models/definitions/labels';
import { IDayLabelDocument } from '../../../models/definitions/dayLabels';

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

const getDivederInMonth = async (models: IModels, year, month) => {
  const dayInMonth = new Date(year, month, 0).getDate();
  const publicLabels: ILabelDocument[] = await models.Labels.find({
    effect: 'public'
  }).lean();
  const multiplierByLabelId = {};

  for (const label of publicLabels) {
    multiplierByLabelId[label._id] = label.multiplier;
  }

  const publicLabelIds = publicLabels.map(pl => pl._id);

  const dayLabels: IDayLabelDocument[] = await models.DayLabels.find({
    date: {
      $gte: new Date(year, month, 1),
      $lte: new Date(year, month, dayInMonth, 23, 59, 59)
    },
    labelIds: { $in: publicLabelIds }
  }).lean();

  let divider = dayInMonth;

  for (const dayLabel of dayLabels) {
    const currentPubliceLabelIds = dayLabel.labelIds.filter(lId =>
      publicLabelIds.includes(lId)
    );

    for (const labelId of currentPubliceLabelIds) {
      divider += multiplierByLabelId[labelId] - 1;
    }
  }

  return divider;
};

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

  const daysInMonth = await getDivederInMonth(
    models,
    date.getFullYear(),
    date.getMonth() + 1
  );

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
