import * as moment from 'moment';
import { Stages } from '../../../db/models';
import { getNextMonth, getToday } from '../../utils';

export const contains = (values: string[] = [], empty = false) => {
  if (empty) {
    return [];
  }

  return { $in: values };
};

export const generateCommonFilters = async (args: any) => {
  const {
    $and,
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
    order,
    probability,
    initialStageId,
  } = args;

  const assignedToNoOne = value => {
    return value.length === 1 && value[0].length === 0;
  };

  const filter: any = {};

  if (assignedUserIds) {
    // Filter by assigned to no one
    const notAssigned = assignedToNoOne(assignedUserIds);

    filter.assignedUserIds = notAssigned ? contains([], true) : contains(assignedUserIds);
  }

  if ($and) {
    filter.$and = $and;
  }

  if (customerIds) {
    filter.customerIds = contains(customerIds);
  }

  if (companyIds) {
    filter.companyIds = contains(companyIds);
  }

  if (order) {
    filter.order = order;
  }

  if (probability) {
    filter.probability = probability;
  }

  if (initialStageId) {
    filter.initialStageId = initialStageId;
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

export const generateDealCommonFilters = async (args: any, extraParams?: any) => {
  const filter = await generateCommonFilters(args);
  const { productIds } = extraParams || args;

  if (productIds) {
    filter['productsData.productId'] = contains(productIds);
  }

  return filter;
};

export const generateTicketCommonFilters = async (args: any, extraParams?: any) => {
  const filter = await generateCommonFilters(args);
  const { priority, source } = extraParams || args;

  if (priority) {
    filter.priority = contains(priority);
  }

  if (source) {
    filter.source = contains(source);
  }

  return filter;
};

export const generateTaskCommonFilters = async (args: any, extraParams?: any) => {
  const filter = await generateCommonFilters(args);
  const { priority } = extraParams || args;

  if (priority) {
    filter.priority = contains(priority);
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
