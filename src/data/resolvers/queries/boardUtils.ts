import * as moment from 'moment';
import { Conformities, Stages } from '../../../db/models';
import { getNextMonth, getToday, regexSearchText } from '../../utils';

export const contains = (values: string[] = [], empty = false) => {
  if (empty) {
    return [];
  }

  return { $in: values };
};

export const generateCommonFilters = async (args: any) => {
  const {
    $and,
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
    conformityMainType,
    conformityMainTypeId,
    conformityIsRelated,
    conformityIsSaved,
    order,
    probability,
    initialStageId,
    type,
  } = args;

  const assignedToNoOne = value => {
    return value.length === 1 && value[0].length === 0;
  };

  const filter: any = {};
  let filterIds: string[] = [];

  if (assignedUserIds) {
    // Filter by assigned to no one
    const notAssigned = assignedToNoOne(assignedUserIds);

    filter.assignedUserIds = notAssigned ? contains([], true) : contains(assignedUserIds);
  }

  if ($and) {
    filter.$and = $and;
  }

  if (customerIds && type) {
    const relIds = await Conformities.filterConformity({
      mainType: 'customer',
      mainTypeIds: customerIds,
      relType: type,
    });

    filterIds = relIds;
  }

  if (companyIds && type) {
    const relIds = await Conformities.filterConformity({
      mainType: 'company',
      mainTypeIds: companyIds,
      relType: type,
    });

    filterIds = filterIds.length ? filterIds.filter(id => relIds.includes(id)) : relIds;
  }

  if (customerIds || companyIds) {
    filter._id = contains(filterIds || []);
  }

  if (conformityMainType && conformityMainTypeId) {
    if (conformityIsSaved) {
      const relIds = await Conformities.savedConformity({
        mainType: conformityMainType,
        mainTypeId: conformityMainTypeId,
        relType: type,
      });

      filter._id = contains(relIds || []);
    }

    if (conformityIsRelated) {
      const relIds = await Conformities.relatedConformity({
        mainType: conformityMainType,
        mainTypeId: conformityMainTypeId,
        relType: type,
      });

      filter._id = contains(relIds || []);
    }
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
      $gte: new Date(tommorrow.startOf('day').toISOString()),
      $lte: new Date(tommorrow.endOf('day').toISOString()),
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
    Object.assign(filter, regexSearchText(search));
  }

  if (stageId) {
    filter.stageId = stageId;
  }

  return filter;
};

export const generateDealCommonFilters = async (args: any, extraParams?: any) => {
  args.type = 'deal';
  const filter = await generateCommonFilters(args);
  const { productIds } = extraParams || args;

  if (productIds) {
    filter['productsData.productId'] = contains(productIds);
  }

  // Calendar monthly date
  const { date, pipelineId } = args;

  if (date) {
    const stageIds = await Stages.find({ pipelineId }).distinct('_id');

    filter.closeDate = dateSelector(date);
    filter.stageId = { $in: stageIds };
  }

  return filter;
};

export const generateTicketCommonFilters = async (args: any, extraParams?: any) => {
  args.type = 'ticket';
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
  args.type = 'task';
  const filter = await generateCommonFilters(args);
  const { priority } = extraParams || args;

  if (priority) {
    filter.priority = contains(priority);
  }

  return filter;
};

export const generateGrowthHackCommonFilters = async (args: any, extraParams?: any) => {
  args.type = 'growthHack';

  const { hackStage, priority, pipelineId, stageId } = extraParams || args;

  const filter = await generateCommonFilters(args);

  if (hackStage) {
    filter.hackStages = { $in: [hackStage] };
  }

  if (priority) {
    filter.priority = priority;
  }

  if (!stageId && pipelineId) {
    const stageIds = await Stages.find({ pipelineId }).distinct('_id');

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
