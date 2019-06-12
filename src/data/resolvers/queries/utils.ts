import * as moment from 'moment';
import { Stages } from '../../../db/models';

export const paginate = (collection, params: { page?: number; perPage?: number }) => {
  const { page = 0, perPage = 0 } = params || {};

  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  return collection.limit(_limit).skip((_page - 1) * _limit);
};

const contains = (values: string[] = [], empty = false) => {
  if (empty) {
    return [];
  }

  return { $in: values };
};

export const generateCommonFilters = async (args: any) => {
  const {
    date,
    pipelineId,
    stageId,
    search,
    overdue,
    nextMonth,
    nextDay,
    nextWeek,
    noCloseDate,
    assignedUserIds,
    customerIds,
    companyIds,
    productIds,
  } = args;

  const filter: any = {};

  const assignedToNoOne = value => {
    return value.length === 1 && value[0].length === 0;
  };

  if (assignedUserIds) {
    // Filter by assigned to no one
    const notAssigned = assignedToNoOne(assignedUserIds);

    filter.assignedUserIds = notAssigned ? contains([], true) : contains(assignedUserIds);
  }

  if (customerIds) {
    filter.customerIds = contains(customerIds);
  }

  if (companyIds) {
    filter.companyIds = contains(companyIds);
  }

  if (productIds) {
    filter['productsData.productId'] = contains(productIds);
  }

  if (nextDay) {
    const tommorrow = moment().add(1, 'days');

    filter.closeDate = {
      $gte: new Date(tommorrow.startOf('day').format('YYYY-MM-DD')),
      $lte: new Date(tommorrow.endOf('day').format('YYYY-MM-DD')),
    };
  }

  if (nextWeek) {
    const monday = moment()
      .day(1 + 7)
      .format('YYYY-MM-DD');
    const nextSunday = moment()
      .day(7 + 7)
      .format('YYYY-MM-DD');

    filter.closeDate = {
      $gte: new Date(monday),
      $lte: new Date(nextSunday),
    };
  }

  if (nextMonth) {
    const now = new Date();
    const { start, end } = getNextMonth(now);

    filter.closeDate = {
      $gte: new Date(start),
      $lte: new Date(end),
    };
  }

  if (noCloseDate) {
    filter.closeDate = { $exists: false };
  }

  if (overdue) {
    const now = new Date();
    const today = getToday(now);

    filter.closeDate = { $lt: today };
  }

  if (search) {
    filter.$or = [
      { name: new RegExp(`.*${search || ''}.*`, 'i') },
      { description: new RegExp(`.*${search || ''}.*`, 'i') },
    ];
  }

  if (stageId) {
    filter.stageId = stageId;
  }

  // Calendar monthly date
  if (date) {
    const stageIds = await Stages.find({ pipelineId }).distinct('_id');

    filter.closeDate = dateSelector(date);
    filter.stageId = { $in: stageIds };
  }

  return filter;
};

interface IDate {
  month: number;
  year: number;
}

export const dateSelector = (date: IDate) => {
  const { year, month } = date;
  const currentDate = new Date();

  const start = currentDate.setFullYear(year, month, 1);
  const end = currentDate.setFullYear(year, month + 1, 0);

  return {
    $gte: new Date(start),
    $lte: new Date(end),
  };
};

/*
 * Converts given value to date or if value in valid date
 * then returns default value
 */
export const fixDate = (value, defaultValue = new Date()): Date => {
  const date = new Date(value);

  if (!isNaN(date.getTime())) {
    return date;
  }

  return defaultValue;
};

export const getDate = (date: Date, day: number): Date => {
  const currentDate = new Date();

  date.setDate(currentDate.getDate() + day + 1);
  date.setHours(0, 0, 0, 0);

  return date;
};

const getToday = (date: Date): Date => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
};

const getNextMonth = (date: Date): { start: number; end: number } => {
  const today = getToday(date);

  const month = (new Date().getMonth() + 1) % 12;
  const start = today.setMonth(month, 1);
  const end = today.setMonth(month + 1, 0);

  return { start, end };
};
