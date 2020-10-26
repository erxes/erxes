import * as moment from 'moment';
import { Conformities, Pipelines, Stages } from '../../../db/models';
import { IItemCommonFields } from '../../../db/models/definitions/boards';
import { BOARD_STATUSES } from '../../../db/models/definitions/constants';
import { getNextMonth, getToday, regexSearchText } from '../../utils';
import { IListParams } from './boards';

export interface IArchiveArgs {
  pipelineId: string;
  search: string;
  page?: number;
  perPage?: number;
}

const contains = (values: string[]) => {
  return { $in: values };
};

export const generateCommonFilters = async (currentUserId: string, args: any) => {
  const {
    pipelineId,
    stageId,
    search,
    closeDateType,
    assignedUserIds,
    customerIds,
    companyIds,
    conformityMainType,
    conformityMainTypeId,
    conformityIsRelated,
    conformityIsSaved,
    initialStageId,
    type,
    labelIds,
    priority,
    userIds,
  } = args;

  const isListEmpty = value => {
    return value.length === 1 && value[0].length === 0;
  };

  const filter: any = { status: { $ne: BOARD_STATUSES.ARCHIVED } };

  let filterIds: string[] = [];

  if (assignedUserIds) {
    // Filter by assigned to no one
    const notAssigned = isListEmpty(assignedUserIds);

    filter.assignedUserIds = notAssigned ? [] : contains(assignedUserIds);
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
        relTypes: [type],
      });

      filter._id = contains(relIds || []);
    }

    if (conformityIsRelated) {
      const relIds = await Conformities.relatedConformity({
        mainType: conformityMainType,
        mainTypeId: conformityMainTypeId,
        relType: type,
      });

      filter._id = contains(relIds);
    }
  }

  if (initialStageId) {
    filter.initialStageId = initialStageId;
  }

  if (closeDateType) {
    if (closeDateType === 'nextDay') {
      const tommorrow = moment().add(1, 'days');

      filter.closeDate = {
        $gte: new Date(tommorrow.startOf('day').toISOString()),
        $lte: new Date(tommorrow.endOf('day').toISOString()),
      };
    }

    if (closeDateType === 'nextWeek') {
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

    if (closeDateType === 'nextMonth') {
      const now = new Date();
      const { start, end } = getNextMonth(now);

      filter.closeDate = {
        $gte: new Date(start),
        $lte: new Date(end),
      };
    }

    if (closeDateType === 'noCloseDate') {
      filter.closeDate = { $exists: false };
    }

    if (closeDateType === 'overdue') {
      const now = new Date();
      const today = getToday(now);

      filter.closeDate = { $lt: today };
    }
  }

  if (search) {
    Object.assign(filter, regexSearchText(search));
  }

  if (stageId) {
    filter.stageId = stageId;
  }

  if (labelIds) {
    const isEmpty = isListEmpty(labelIds);

    filter.labelIds = isEmpty ? { $in: [null, []] } : { $in: labelIds };
  }

  if (priority) {
    filter.priority = contains(priority);
  }

  if (pipelineId) {
    const pipeline = await Pipelines.getPipeline(pipelineId);
    if (pipeline.isCheckUser && !(pipeline.excludeCheckUserIds || []).includes(currentUserId)) {
      Object.assign(filter, { $or: [{ assignedUserIds: { $in: [currentUserId] } }, { userId: currentUserId }] });
    }
  }

  if (userIds) {
    const isEmpty = isListEmpty(userIds);

    filter.userId = isEmpty ? { $in: [null, []] } : { $in: userIds };
  }

  return filter;
};

export const generateDealCommonFilters = async (currentUserId: string, args: any, extraParams?: any) => {
  args.type = 'deal';

  const filter = await generateCommonFilters(currentUserId, args);
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

export const generateTicketCommonFilters = async (currentUserId: string, args: any, extraParams?: any) => {
  args.type = 'ticket';

  const filter = await generateCommonFilters(currentUserId, args);
  const { source } = extraParams || args;

  if (source) {
    filter.source = contains(source);
  }

  return filter;
};

export const generateTaskCommonFilters = async (currentUserId: string, args: any) => {
  args.type = 'task';

  return generateCommonFilters(currentUserId, args);
};

export const generateSort = (args: IListParams) => {
  let sort: any = { order: 1, createdAt: -1 };

  const { sortField, sortDirection } = args;

  if (sortField && sortDirection) {
    sort = { [sortField]: sortDirection };
  }

  return sort;
};

export const generateGrowthHackCommonFilters = async (currentUserId: string, args: any, extraParams?: any) => {
  args.type = 'growthHack';

  const { hackStage, pipelineId, stageId } = extraParams || args;

  const filter = await generateCommonFilters(currentUserId, args);

  if (hackStage) {
    filter.hackStages = contains(hackStage);
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

const dateSelector = (date: IDate) => {
  const { year, month } = date;

  const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0));

  return {
    $gte: start,
    $lte: end,
  };
};

export const checkItemPermByUser = async (currentUserId: string, item: IItemCommonFields) => {
  const stage = await Stages.getStage(item.stageId);

  const pipeline = await Pipelines.getPipeline(stage.pipelineId);

  if (pipeline.visibility === 'private' && !(pipeline.memberIds || []).includes(currentUserId)) {
    throw new Error('You do not have permission to view.');
  }

  // pipeline is Show only the users assigned(created) cards checked
  // and current user nothing dominant users
  // current user hans't this carts assigned and created
  if (
    pipeline.isCheckUser &&
    !(pipeline.excludeCheckUserIds || []).includes(currentUserId) &&
    !((item.assignedUserIds || []).includes(currentUserId) || item.userId === currentUserId)
  ) {
    throw new Error('You do not have permission to view.');
  }

  return item;
};

export const archivedItems = async (params: IArchiveArgs, collection: any) => {
  const { pipelineId, search, ...listArgs } = params;

  const filter: any = { status: BOARD_STATUSES.ARCHIVED };
  const { page = 0, perPage = 0 } = listArgs;

  const stages = await Stages.find({ pipelineId });

  if (stages.length > 0) {
    filter.stageId = { $in: stages.map(stage => stage._id) };

    if (search) {
      Object.assign(filter, regexSearchText(search, 'name'));
    }

    return collection
      .find(filter)
      .sort({
        modifiedAt: -1,
      })
      .skip(page || 0)
      .limit(perPage || 20);
  }

  return [];
};

export const archivedItemsCount = async (params: IArchiveArgs, collection: any) => {
  const { pipelineId, search } = params;

  const filter: any = { status: BOARD_STATUSES.ARCHIVED };

  const stages = await Stages.find({ pipelineId });

  if (stages.length > 0) {
    filter.stageId = { $in: stages.map(stage => stage._id) };

    if (search) {
      Object.assign(filter, regexSearchText(search, 'name'));
    }

    return collection.countDocuments(filter);
  }

  return 0;
};
