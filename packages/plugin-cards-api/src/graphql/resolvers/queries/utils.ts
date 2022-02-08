import * as moment from 'moment';
import {
  Pipelines,
  // Segments,
  Stages
} from '../../../models';
import { getCollection } from '../../../models/utils';
import {
  IItemCommonFields,
  IStageDocument
} from '../../../models/definitions/boards';
import { BOARD_STATUSES } from '../../../models/definitions/constants';
import { IUserDocument } from '@erxes/common-types/src/users';
import { CLOSE_DATE_TYPES } from '../../../constants';
import { getNextMonth, getToday, regexSearchText } from '@erxes/api-utils/src';
import { IListParams } from './boards';
import { Notifications, Segments } from '../../../apiCollections';
import {
  fetchSegment,
  sendContactRPCMessage,
  sendConformityMessage
} from '../../../messageBroker';

export interface IArchiveArgs {
  pipelineId: string;
  search: string;
  page?: number;
  perPage?: number;
  userIds?: string[];
  priorities?: string[];
  assignedUserIds?: string[];
  labelIds?: string[];
  productIds?: string[];
  companyIds?: string[];
  customerIds?: string[];
  startDate?: string;
  endDate?: string;
  sources?: string[];
  hackStages?: string[];
}

const contains = (values: string[]) => {
  return { $in: values };
};

export const getCloseDateByType = (closeDateType: string) => {
  if (closeDateType === CLOSE_DATE_TYPES.NEXT_DAY) {
    const tommorrow = moment().add(1, 'days');

    return {
      $gte: new Date(tommorrow.startOf('day').toISOString()),
      $lte: new Date(tommorrow.endOf('day').toISOString())
    };
  }

  if (closeDateType === CLOSE_DATE_TYPES.NEXT_WEEK) {
    const monday = moment()
      .day(1 + 7)
      .format('YYYY-MM-DD');
    const nextSunday = moment()
      .day(7 + 7)
      .format('YYYY-MM-DD');

    return {
      $gte: new Date(monday),
      $lte: new Date(nextSunday)
    };
  }

  if (closeDateType === CLOSE_DATE_TYPES.NEXT_MONTH) {
    const now = new Date();
    const { start, end } = getNextMonth(now);

    return {
      $gte: new Date(start),
      $lte: new Date(end)
    };
  }

  if (closeDateType === CLOSE_DATE_TYPES.NO_CLOSE_DATE) {
    return { $exists: false };
  }

  if (closeDateType === CLOSE_DATE_TYPES.OVERDUE) {
    const now = new Date();
    const today = getToday(now);

    return { $lt: today };
  }
};

export const generateExtraFilters = async (filter, extraParams) => {
  const { source, userIds, priority, startDate, endDate } = extraParams;

  const isListEmpty = value => {
    return value.length === 1 && value[0].length === 0;
  };

  if (source) {
    filter.source = contains(source);
  }

  if (userIds) {
    const isEmpty = isListEmpty(userIds);

    filter.userId = isEmpty ? { $in: [null, []] } : { $in: userIds };
  }

  if (priority) {
    filter.priority = contains(priority);
  }

  if (startDate) {
    filter.closeDate = {
      $gte: new Date(startDate)
    };
  }

  if (endDate) {
    if (filter.closeDate) {
      filter.closeDate.$lte = new Date(endDate);
    } else {
      filter.closeDate = {
        $lte: new Date(endDate)
      };
    }
  }

  return filter;
};

export const generateCommonFilters = async (
  currentUserId: string,
  args: any
) => {
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
    segment,
    assignedToMe,
    startDate,
    endDate,
    hasStartAndCloseDate
  } = args;

  const isListEmpty = value => {
    return value.length === 1 && value[0].length === 0;
  };

  const filter: any = { status: { $ne: BOARD_STATUSES.ARCHIVED } };

  const filterIds: string[] = [];

  if (assignedUserIds) {
    // Filter by assigned to no one
    const notAssigned = isListEmpty(assignedUserIds);

    filter.assignedUserIds = notAssigned ? [] : contains(assignedUserIds);
  }

  if (customerIds && type) {
    // const relIds = await Conformities.filterConformity({
    //   mainType: 'customer',
    //   mainTypeIds: customerIds,
    //   relType: type
    // });
    // filterIds = relIds;
  }

  if (companyIds && type) {
    // const relIds = await Conformities.filterConformity({
    //   mainType: 'company',
    //   mainTypeIds: companyIds,
    //   relType: type
    // });
    // filterIds = filterIds.length
    //   ? filterIds.filter(id => relIds.includes(id))
    //   : relIds;
  }

  if (customerIds || companyIds) {
    filter._id = contains(filterIds || []);
  }

  if (conformityMainType && conformityMainTypeId) {
    if (conformityIsSaved) {
      // const relIds = await Conformities.savedConformity({
      //   mainType: conformityMainType,
      //   mainTypeId: conformityMainTypeId,
      //   relTypes: [type]
      // });
      // filter._id = contains(relIds || []);
    }

    if (conformityIsRelated) {
      // const relIds = await Conformities.relatedConformity({
      //   mainType: conformityMainType,
      //   mainTypeId: conformityMainTypeId,
      //   relType: type
      // });
      // filter._id = contains(relIds);
    }
  }

  if (initialStageId) {
    filter.initialStageId = initialStageId;
  }

  if (closeDateType) {
    filter.closeDate = getCloseDateByType(closeDateType);
  }

  if (startDate) {
    filter.closeDate = {
      $gte: new Date(startDate)
    };
  }

  if (endDate) {
    if (filter.closeDate) {
      filter.closeDate.$lte = new Date(endDate);
    } else {
      filter.closeDate = {
        $lte: new Date(endDate)
      };
    }
  }

  if (search) {
    Object.assign(filter, regexSearchText(search));
  }

  if (stageId) {
    filter.stageId = stageId;
  } else if (pipelineId) {
    const stageIds = await Stages.find({
      pipelineId,
      status: { $ne: BOARD_STATUSES.ARCHIVED }
    }).distinct('_id');

    filter.stageId = { $in: stageIds };
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
    if (
      pipeline.isCheckUser &&
      !(pipeline.excludeCheckUserIds || []).includes(currentUserId)
    ) {
      Object.assign(filter, {
        $or: [
          { assignedUserIds: { $in: [currentUserId] } },
          { userId: currentUserId }
        ]
      });
    }
  }

  if (userIds) {
    const isEmpty = isListEmpty(userIds);

    filter.userId = isEmpty ? { $in: [null, []] } : { $in: userIds };
  }

  if (assignedToMe) {
    filter.assignedUserIds = { $in: [currentUserId] };
  }

  if (segment) {
    const segmentObj = await Segments.findOne({ _id: segment });
    const itemIds = await fetchSegment(segmentObj);

    filter._id = { $in: itemIds };
  }

  if (hasStartAndCloseDate) {
    filter.startDate = { $exists: true };
    filter.closeDate = { $exists: true };
  }

  return filter;
};

export const calendarFilters = async (filter, args) => {
  const { date, pipelineId } = args;

  if (date) {
    const stageIds = await Stages.find({ pipelineId }).distinct('_id');

    filter.closeDate = dateSelector(date);
    filter.stageId = { $in: stageIds };
  }

  return filter;
};

export const generateDealCommonFilters = async (
  currentUserId: string,
  args: any,
  extraParams?: any
) => {
  args.type = 'deal';
  const { productIds } = extraParams || args;

  let filter = await generateCommonFilters(currentUserId, args);

  if (extraParams) {
    filter = await generateExtraFilters(filter, extraParams);
  }

  if (productIds) {
    filter['productsData.productId'] = contains(productIds);
  }

  // Calendar monthly date
  await calendarFilters(filter, args);

  return filter;
};

export const generateTicketCommonFilters = async (
  currentUserId: string,
  args: any,
  extraParams?: any
) => {
  args.type = 'ticket';

  let filter = await generateCommonFilters(currentUserId, args);

  if (extraParams) {
    filter = await generateExtraFilters(filter, extraParams);
  }

  // Calendar monthly date
  await calendarFilters(filter, args);

  return filter;
};

export const generateTaskCommonFilters = async (
  currentUserId: string,
  args: any,
  extraParams?: any
) => {
  args.type = 'task';

  let filter = await generateCommonFilters(currentUserId, args);

  if (extraParams) {
    filter = await generateExtraFilters(filter, extraParams);
  }

  // Calendar monthly date
  await calendarFilters(filter, args);

  return filter;
};

export const generateSort = (args: IListParams) => {
  let sort: any = { order: 1, createdAt: -1 };

  const { sortField, sortDirection } = args;

  if (sortField && sortDirection) {
    sort = { [sortField]: sortDirection };
  }

  return sort;
};

export const generateGrowthHackCommonFilters = async (
  currentUserId: string,
  args: any,
  extraParams?: any
) => {
  args.type = 'growthHack';

  const { hackStage, pipelineId, stageId } = extraParams || args;

  let filter = await generateCommonFilters(currentUserId, args);

  if (extraParams) {
    filter = await generateExtraFilters(filter, extraParams);
  }

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
    $lte: end
  };
};

export const checkItemPermByUser = async (
  currentUserId: string,
  item: IItemCommonFields
) => {
  const stage = await Stages.getStage(item.stageId);

  const pipeline = await Pipelines.getPipeline(stage.pipelineId);

  if (
    pipeline.visibility === 'private' &&
    !(pipeline.memberIds || []).includes(currentUserId)
  ) {
    throw new Error('You do not have permission to view.');
  }

  // pipeline is Show only the users assigned(created) cards checked
  // and current user nothing dominant users
  // current user hans't this carts assigned and created
  if (
    pipeline.isCheckUser &&
    !(pipeline.excludeCheckUserIds || []).includes(currentUserId) &&
    !(
      (item.assignedUserIds || []).includes(currentUserId) ||
      item.userId === currentUserId
    )
  ) {
    throw new Error('You do not have permission to view.');
  }

  return item;
};

export const archivedItems = async (params: IArchiveArgs, collection: any) => {
  const { pipelineId, ...listArgs } = params;

  const { page = 0, perPage = 0 } = listArgs;

  const stages = await Stages.find({ pipelineId }).lean();

  if (stages.length > 0) {
    const filter = generateArhivedItemsFilter(params, stages);

    return collection
      .find(filter)
      .sort({
        modifiedAt: -1
      })
      .skip(page || 0)
      .limit(perPage || 20)
      .lean();
  }

  return [];
};

export const archivedItemsCount = async (
  params: IArchiveArgs,
  collection: any
) => {
  const { pipelineId } = params;

  const stages = await Stages.find({ pipelineId });

  if (stages.length > 0) {
    const filter = generateArhivedItemsFilter(params, stages);

    return collection.countDocuments(filter);
  }

  return 0;
};

const generateArhivedItemsFilter = (
  params: IArchiveArgs,
  stages: IStageDocument[]
) => {
  const {
    search,
    userIds,
    priorities,
    assignedUserIds,
    labelIds,
    productIds,
    startDate,
    endDate,
    sources,
    hackStages
  } = params;

  const filter: any = { status: BOARD_STATUSES.ARCHIVED };

  filter.stageId = { $in: stages.map(stage => stage._id) };

  if (search) {
    Object.assign(filter, regexSearchText(search, 'name'));
  }

  if (userIds && userIds.length) {
    filter.userId = { $in: userIds };
  }

  if (priorities && priorities.length) {
    filter.priority = { $in: priorities };
  }

  if (assignedUserIds && assignedUserIds.length) {
    filter.assignedUserIds = { $in: assignedUserIds };
  }

  if (labelIds && labelIds.length) {
    filter.labelIds = { $in: labelIds };
  }

  if (productIds && productIds.length) {
    filter['productsData.productId'] = { $in: productIds };
  }

  if (startDate) {
    filter.closeDate = {
      $gte: new Date(startDate)
    };
  }

  if (endDate) {
    if (filter.closeDate) {
      filter.closeDate.$lte = new Date(endDate);
    } else {
      filter.closeDate = {
        $lte: new Date(endDate)
      };
    }
  }

  if (sources && sources.length) {
    filter.source = { $in: sources };
  }

  if (hackStages && hackStages.length) {
    filter.hackStages = { $in: hackStages };
  }

  return filter;
};

export const getItemList = async (
  filter: any,
  args: IListParams,
  user: IUserDocument,
  type: string,
  extraFields?: { [key: string]: number },
  getExtraFields?: (item: any) => { [key: string]: any }
) => {
  const { collection } = getCollection(type);
  const sort = generateSort(args);
  const limit = args.limit !== undefined ? args.limit : 10;

  const pipelines: any[] = [
    {
      $match: filter
    },
    {
      $sort: sort
    },
    {
      $skip: args.skip || 0
    },
    {
      $lookup: {
        from: 'users',
        localField: 'assignedUserIds',
        foreignField: '_id',
        as: 'users_doc'
      }
    },
    {
      $lookup: {
        from: 'stages',
        localField: 'stageId',
        foreignField: '_id',
        as: 'stages_doc'
      }
    },
    {
      $lookup: {
        from: 'pipeline_labels',
        localField: 'labelIds',
        foreignField: '_id',
        as: 'labels_doc'
      }
    },
    {
      $project: {
        assignedUsers: '$users_doc',
        labels: '$labels_doc',
        stage: { $arrayElemAt: ['$stages_doc', 0] },
        name: 1,
        isComplete: 1,
        startDate: 1,
        closeDate: 1,
        relations: 1,
        modifiedAt: 1,
        priority: 1,
        number: 1,
        watchedUserIds: 1,
        ...(extraFields || {})
      }
    }
  ];

  if (limit > 0) {
    pipelines.splice(3, 0, { $limit: limit });
  }

  const list = await collection.aggregate(pipelines);

  const ids = list.map(item => item._id);

  const conformities = await sendConformityMessage('getConformities', {
    mainType: type,
    mainTypeIds: ids,
    relTypes: ['company', 'customer']
  });

  const companyIds: string[] = [];
  const customerIds: string[] = [];
  const companyIdsByItemId = {};
  const customerIdsByItemId = {};

  const perConformity = (
    conformity,
    cocIdsByItemId,
    cocIds,
    typeId1,
    typeId2
  ) => {
    cocIds.push(conformity[typeId1]);

    if (!cocIdsByItemId[conformity[typeId2]]) {
      cocIdsByItemId[conformity[typeId2]] = [];
    }

    cocIdsByItemId[conformity[typeId2]].push(conformity[typeId1]);
  };

  for (const conf of conformities) {
    if (conf.mainType === 'company') {
      perConformity(
        conf,
        companyIdsByItemId,
        companyIds,
        'mainTypeId',
        'relTypeId'
      );
      continue;
    }
    if (conf.relType === 'company') {
      perConformity(
        conf,
        companyIdsByItemId,
        companyIds,
        'relTypeId',
        'mainTypeId'
      );
      continue;
    }
    if (conf.mainType === 'customer') {
      perConformity(
        conf,
        customerIdsByItemId,
        customerIds,
        'mainTypeId',
        'relTypeId'
      );
      continue;
    }
    if (conf.relType === 'customer') {
      perConformity(
        conf,
        customerIdsByItemId,
        customerIds,
        'relTypeId',
        'mainTypeId'
      );
      continue;
    }
  }

  const companies = await sendContactRPCMessage('findActiveCompanies', {
    selector: {
      _id: { $in: [...new Set(companyIds)] }
    },
    fields: {
      primaryName: 1,
      primaryEmail: 1,
      primaryPhone: 1,
      emails: 1,
      phones: 1
    }
  });

  const customers = await sendContactRPCMessage('findActiveCustomers', {
    selector: {
      _id: { $in: [...new Set(customerIds)] }
    },
    fields: {
      firstName: 1,
      lastName: 1,
      middleName: 1,
      visitorContactInfo: 1,
      primaryEmail: 1,
      primaryPhone: 1,
      emails: 1,
      phones: 1
    }
  });

  const getCocsByItemId = (
    itemId: string,
    cocIdsByItemId: any,
    cocs: any[]
  ) => {
    const cocIds = cocIdsByItemId[itemId] || [];

    return cocIds.flatMap((cocId: string) => {
      const found = cocs.find(coc => cocId === coc._id);

      return found || [];
    });
  };

  const updatedList: any[] = [];

  const notifications = await Notifications.find(
    { contentTypeId: { $in: ids }, isRead: false, receiver: user._id },
    { contentTypeId: 1 }
  ).toArray();

  for (const item of list) {
    const notification = notifications.find(n => n.contentTypeId === item._id);

    updatedList.push({
      ...item,
      isWatched: (item.watchedUserIds || []).includes(user._id),
      hasNotified: notification ? false : true,
      customers: getCocsByItemId(item._id, customerIdsByItemId, customers),
      companies: getCocsByItemId(item._id, companyIdsByItemId, companies),
      ...(getExtraFields ? await getExtraFields(item) : {})
    });
  }

  return updatedList;
};
