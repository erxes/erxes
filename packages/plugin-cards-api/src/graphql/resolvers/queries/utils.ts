import * as moment from 'moment';
import { getCollection } from '../../../models/utils';
import {
  IItemCommonFields,
  IStageDocument
} from '../../../models/definitions/boards';
import { BOARD_STATUSES } from '../../../models/definitions/constants';
import { CLOSE_DATE_TYPES } from '../../../constants';
import { getNextMonth, getToday, regexSearchText } from '@erxes/api-utils/src';
import { IListParams } from './boards';
import {
  fetchSegment,
  sendContactsMessage,
  sendCoreMessage,
  sendFormsMessage,
  sendNotificationsMessage,
  sendSegmentsMessage
} from '../../../messageBroker';
import { IUserDocument } from '@erxes/api-utils/src/types';
import { IModels } from '../../../connectionResolver';

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
  models: IModels,
  subdomain: string,
  currentUserId: string,
  args: any
) => {
  const {
    _ids,
    pipelineId,
    pipelineIds,
    stageId,
    parentId,
    boardIds,
    stageCodes,
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
    tagIds,
    segment,
    segmentData,
    assignedToMe,
    startDate,
    endDate,
    hasStartAndCloseDate,
    stageChangedStartDate,
    stageChangedEndDate,
    noSkipArchive,
    number,
    branchIds,
    departmentIds,
    dateRangeFilters
  } = args;

  const isListEmpty = value => {
    return value.length === 1 && value[0].length === 0;
  };

  const filter: any = noSkipArchive
    ? {}
    : { status: { $ne: BOARD_STATUSES.ARCHIVED }, parentId: undefined };

  let filterIds: string[] = [];

  if (parentId) {
    filter.parentId = parentId;
  }

  if (assignedUserIds) {
    // Filter by assigned to no one
    const notAssigned = isListEmpty(assignedUserIds);

    filter.assignedUserIds = notAssigned ? [] : contains(assignedUserIds);
  }

  if (branchIds) {
    const branchOrders = (
      await sendCoreMessage({
        subdomain,
        action: `branches.find`,
        data: {
          query: { _id: { $in: branchIds } }
        },
        isRPC: true,
        defaultValue: []
      })
    ).map(item => item.order);

    const ids = (
      await sendCoreMessage({
        subdomain,
        action: `branches.find`,
        data: {
          query: { order: { $regex: branchOrders.join('|'), $options: 'i' } }
        },
        isRPC: true,
        defaultValue: []
      })
    ).map(item => item._id);

    filter.branchIds = { $in: ids };
  }
  if (departmentIds) {
    const departmentOrders = (
      await sendCoreMessage({
        subdomain,
        action: `departments.find`,
        data: {
          _id: { $in: departmentIds }
        },
        isRPC: true,
        defaultValue: []
      })
    ).map(item => item.order);

    const ids = (
      await sendCoreMessage({
        subdomain,
        action: `departments.find`,
        data: {
          order: { $regex: departmentOrders.join('|'), $options: 'i' }
        },
        isRPC: true,
        defaultValue: []
      })
    ).map(item => item._id);

    filter.departmentIds = { $in: ids };
  }

  if (customerIds && type) {
    const relIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.filterConformity',
      data: {
        mainType: 'customer',
        mainTypeIds: customerIds,
        relType: type
      },
      isRPC: true,
      defaultValue: []
    });

    filterIds = relIds;
  }

  if (companyIds && type) {
    const relIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.filterConformity',
      data: {
        mainType: 'company',
        mainTypeIds: companyIds,
        relType: type
      },
      isRPC: true,
      defaultValue: []
    });

    filterIds = filterIds.length
      ? filterIds.filter(id => relIds.includes(id))
      : relIds;
  }

  if (customerIds || companyIds) {
    filter._id = contains(filterIds || []);
  }

  if (_ids && _ids.length) {
    filter._id = contains(_ids);
  }

  if (conformityMainType && conformityMainTypeId) {
    if (conformityIsSaved) {
      const relIds = await sendCoreMessage({
        subdomain,
        action: 'conformities.savedConformity',
        data: {
          mainType: conformityMainType,
          mainTypeId: conformityMainTypeId,
          relTypes: [type]
        },
        isRPC: true,
        defaultValue: []
      });

      filter._id = contains(relIds || []);
    }

    if (conformityIsRelated) {
      const relIds = await sendCoreMessage({
        subdomain,
        action: 'conformities.relatedConformity',
        data: {
          mainType: conformityMainType,
          mainTypeId: conformityMainTypeId,
          relType: type
        },
        isRPC: true,
        defaultValue: []
      });

      filter._id = contains(relIds);
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

  if (dateRangeFilters) {
    for (const dateRangeFilter of dateRangeFilters) {
      const { name, from, to } = dateRangeFilter;

      if (from) {
        filter[name] = { $gte: new Date(from) };
      }

      if (to) {
        filter[name] = { ...filter[name], $lte: new Date(to) };
      }
    }
  }

  const stageChangedDateFilter: any = {};
  if (stageChangedStartDate) {
    stageChangedDateFilter.$gte = new Date(stageChangedStartDate);
  }
  if (stageChangedEndDate) {
    stageChangedDateFilter.$lte = new Date(stageChangedEndDate);
  }
  if (Object.keys(stageChangedDateFilter).length) {
    filter.stageChangedDate = stageChangedDateFilter;
  }

  if (search) {
    Object.assign(filter, regexSearchText(search));
  }

  if (stageId) {
    filter.stageId = stageId;
  } else if (pipelineId || pipelineIds) {
    let filterPipeline = pipelineId;

    if (pipelineIds) {
      filterPipeline = { $in: pipelineIds };
    }

    const stageIds = await models.Stages.find({
      pipelineId: filterPipeline,
      status: { $ne: BOARD_STATUSES.ARCHIVED }
    }).distinct('_id');

    filter.stageId = { $in: stageIds };
  }

  if (boardIds) {
    const pipelineIds = await models.Pipelines.find({
      boardId: { $in: boardIds },
      status: { $ne: BOARD_STATUSES.ARCHIVED }
    }).distinct('_id');

    const filterStages: any = {
      pipelineId: { $in: pipelineIds },
      status: { $ne: BOARD_STATUSES.ARCHIVED }
    };

    if (filter?.stageId?.$in) {
      filterStages._id = { $in: filter?.stageId?.$in };
    }

    const stageIds = await models.Stages.find(filterStages).distinct('_id');

    filter.stageId = { $in: stageIds };
  }

  if (stageCodes) {
    const filterStages: any = { code: { $in: stageCodes } };

    if (filter?.stageId?.$in) {
      filterStages._id = { $in: filter?.stageId?.$in };
    }

    const stageIds = await models.Stages.find(filterStages).distinct('_id');

    filter.stageId = { $in: stageIds };
  }

  if (labelIds) {
    const isEmpty = isListEmpty(labelIds);

    filter.labelIds = isEmpty ? { $in: [null, []] } : { $in: labelIds };
  }

  if (priority) {
    filter.priority = contains(priority);
  }

  if (tagIds) {
    filter.tagIds = { $in: tagIds };
  }

  if (pipelineId) {
    const pipeline = await models.Pipelines.getPipeline(pipelineId);
    if (
      (pipeline.isCheckUser || pipeline.isCheckDepartment) &&
      !(pipeline.excludeCheckUserIds || []).includes(currentUserId)
    ) {
      let includeCheckUserIds: string[] = [];

      if (pipeline.isCheckDepartment) {
        const user = await sendCoreMessage({
          subdomain,
          action: 'users.findOne',
          data: {
            _id: currentUserId
          },
          isRPC: true
        });

        const userDepartmentIds = user?.departmentIds || [];
        const pipelineDepartmentIds = pipeline.departmentIds || [];

        const otherDepartmentUsers = await sendCoreMessage({
          subdomain,
          action: 'users.find',
          data: {
            query: { departmentIds: { $in: userDepartmentIds } }
          },
          isRPC: true,
          defaultValue: []
        });

        for (const departmentUser of otherDepartmentUsers) {
          includeCheckUserIds = [...includeCheckUserIds, departmentUser._id];
        }

        if (
          !!pipelineDepartmentIds.filter(departmentId =>
            userDepartmentIds.includes(departmentId)
          ).length
        ) {
          includeCheckUserIds = includeCheckUserIds.concat(user._id || []);
        }
      }

      const uqinueCheckUserIds = [
        ...new Set(includeCheckUserIds.concat(currentUserId))
      ];

      Object.assign(filter, {
        $or: [
          { assignedUserIds: { $in: uqinueCheckUserIds } },
          { userId: { $in: uqinueCheckUserIds } }
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

  if (segmentData) {
    const segment = JSON.parse(segmentData);
    const itemIds = await fetchSegment(subdomain, '', {}, segment);
    filter._id = { $in: itemIds };
  }

  if (segment) {
    const segmentObj = await sendSegmentsMessage({
      subdomain,
      action: 'findOne',
      data: { _id: segment },
      isRPC: true
    });
    const itemIds = await fetchSegment(subdomain, segmentObj);

    filter._id = { $in: itemIds };
  }

  if (hasStartAndCloseDate) {
    filter.startDate = { $exists: true };
    filter.closeDate = { $exists: true };
  }

  if (number) {
    filter.number = { $regex: `${number}`, $options: 'mui' };
  }

  return filter;
};

export const calendarFilters = async (models: IModels, filter, args) => {
  const { date, pipelineId } = args;

  if (date) {
    const stageIds = await models.Stages.find({ pipelineId }).distinct('_id');

    filter.closeDate = dateSelector(date);
    filter.stageId = { $in: stageIds };
  }

  return filter;
};

export const generateDealCommonFilters = async (
  models: IModels,
  subdomain: string,
  currentUserId: string,
  args = {} as any,
  extraParams?: any
) => {
  args.type = 'deal';
  const { productIds } = extraParams || args;

  let filter = await generateCommonFilters(
    models,
    subdomain,
    currentUserId,
    args
  );

  if (extraParams) {
    filter = await generateExtraFilters(filter, extraParams);
  }

  if (productIds) {
    filter['productsData.productId'] = contains(productIds);
  }

  // Calendar monthly date
  await calendarFilters(models, filter, args);

  return filter;
};

export const generatePurchaseCommonFilters = async (
  models: IModels,
  subdomain: string,
  currentUserId: string,
  args = {} as any,
  extraParams?: any
) => {
  args.type = 'purchase';
  const { productIds } = extraParams || args;

  let filter = await generateCommonFilters(
    models,
    subdomain,
    currentUserId,
    args
  );

  if (extraParams) {
    filter = await generateExtraFilters(filter, extraParams);
  }

  if (productIds) {
    filter['productsData.productId'] = contains(productIds);
  }

  // Calendar monthly date
  await calendarFilters(models, filter, args);

  return filter;
};

export const generateTicketCommonFilters = async (
  models: IModels,
  subdomain: string,
  currentUserId: string,
  args = {} as any,
  extraParams?: any
) => {
  args.type = 'ticket';

  let filter = await generateCommonFilters(
    models,
    subdomain,
    currentUserId,
    args
  );

  if (extraParams) {
    filter = await generateExtraFilters(filter, extraParams);
  }

  // Calendar monthly date
  await calendarFilters(models, filter, args);

  return filter;
};

export const generateTaskCommonFilters = async (
  models: IModels,
  subdomain: string,
  currentUserId: string,
  args = {} as any,
  extraParams?: any
) => {
  args.type = 'task';

  let filter = await generateCommonFilters(
    models,
    subdomain,
    currentUserId,
    args
  );

  if (extraParams) {
    filter = await generateExtraFilters(filter, extraParams);
  }

  // Calendar monthly date
  await calendarFilters(models, filter, args);

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
  models: IModels,
  subdomain: string,
  currentUserId: string,
  args = {} as any,
  extraParams?: any
) => {
  args.type = 'growthHack';

  const { hackStage, pipelineId, stageId } = extraParams || args;

  let filter = await generateCommonFilters(
    models,
    subdomain,
    currentUserId,
    args
  );

  if (extraParams) {
    filter = await generateExtraFilters(filter, extraParams);
  }

  if (hackStage) {
    filter.hackStages = contains(hackStage);
  }

  if (!stageId && pipelineId) {
    const stageIds = await models.Stages.find({ pipelineId }).distinct('_id');

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

// comparing pipelines departmentIds and current user departmentIds
const compareDepartmentIds = (
  pipelineDepartmentIds: string[],
  userDepartmentIds: string[]
): boolean => {
  if (!pipelineDepartmentIds.length || !userDepartmentIds.length) {
    return false;
  }

  for (const uDepartmentId of userDepartmentIds) {
    if (pipelineDepartmentIds.includes(uDepartmentId)) {
      return true;
    }
  }

  return false;
};

export const checkItemPermByUser = async (
  models: IModels,
  user: any,
  item: IItemCommonFields
) => {
  const stage = await models.Stages.getStage(item.stageId);

  const {
    visibility,
    memberIds,
    departmentIds = [],
    isCheckUser,
    excludeCheckUserIds
  } = await models.Pipelines.getPipeline(stage.pipelineId);

  const userDepartmentIds = user.departmentIds || [];

  // check permission on department
  const hasUserInDepartment = compareDepartmentIds(
    departmentIds,
    userDepartmentIds
  );

  if (
    visibility === 'private' &&
    !(memberIds || []).includes(user._id) &&
    !hasUserInDepartment
  ) {
    throw new Error('You do not have permission to view.');
  }

  // pipeline is Show only the users assigned(created) cards checked
  // and current user nothing dominant users
  // current user hans't this carts assigned and created
  if (
    isCheckUser &&
    !(excludeCheckUserIds || []).includes(user._id) &&
    !(
      (item.assignedUserIds || []).includes(user._id) ||
      item.userId === user._id
    )
  ) {
    throw new Error('You do not have permission to view.');
  }

  return item;
};

export const archivedItems = async (
  models: IModels,
  params: IArchiveArgs,
  collection: any
) => {
  const { pipelineId, ...listArgs } = params;

  const { page = 0, perPage = 0 } = listArgs;

  const stages = await models.Stages.find({ pipelineId }).lean();

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
  models: IModels,
  params: IArchiveArgs,
  collection: any
) => {
  const { pipelineId } = params;

  const stages = await models.Stages.find({ pipelineId });

  if (stages.length > 0) {
    const filter = generateArhivedItemsFilter(params, stages);

    return collection.find(filter).count();
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
  models: IModels,
  subdomain: string,
  filter: any,
  args: IListParams,
  user: IUserDocument,
  type: string,
  extraFields?: { [key: string]: number },
  getExtraFields?: (item: any) => { [key: string]: any },
  serverTiming?
) => {
  const { collection } = getCollection(models, type);
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
        createdAt: 1,
        modifiedAt: 1,
        priority: 1,
        number: 1,
        watchedUserIds: 1,
        customFieldsData: 1,
        stageChangedDate: 1,
        tagIds: 1,
        status: 1,
        branchIds: 1,
        departmentIds: 1,
        ...(extraFields || {})
      }
    }
  ];

  if (limit > 0) {
    pipelines.splice(3, 0, { $limit: limit });
  }

  if (serverTiming) {
    serverTiming.startTime('getItemsPipelineAggregate');
  }

  const list = await collection.aggregate(pipelines);

  if (serverTiming) {
    serverTiming.endTime('getItemsPipelineAggregate');
  }

  const ids = list.map(item => item._id);

  if (serverTiming) {
    serverTiming.startTime('conformities');
  }

  const conformities = await sendCoreMessage({
    subdomain,
    action: 'conformities.getConformities',
    data: {
      mainType: type,
      mainTypeIds: ids,
      relTypes: ['company', 'customer']
    },
    isRPC: true,
    defaultValue: []
  });

  if (serverTiming) {
    serverTiming.endTime('conformities');
  }

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

  if (serverTiming) {
    serverTiming.startTime('getItemsCompanies');
  }

  const companies = await sendContactsMessage({
    subdomain,
    action: 'companies.findActiveCompanies',
    data: {
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
    },
    isRPC: true
  });

  if (serverTiming) {
    serverTiming.endTime('getItemsCompanies');
  }

  if (serverTiming) {
    serverTiming.startTime('getItemsCustomers');
  }

  const customers = await sendContactsMessage({
    subdomain,
    action: 'customers.findActiveCustomers',
    data: {
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
    },
    isRPC: true,
    defaultValue: []
  });

  if (serverTiming) {
    serverTiming.endTime('getItemsCustomers');
  }

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

  if (serverTiming) {
    serverTiming.startTime('getItemsNotifications');
  }

  const notifications = await sendNotificationsMessage({
    subdomain,
    action: 'find',
    data: {
      selector: {
        contentTypeId: { $in: ids },
        isRead: false,
        receiver: user._id
      },
      fields: { contentTypeId: 1 }
    },
    isRPC: true,
    defaultValue: []
  });

  if (serverTiming) {
    serverTiming.endTime('getItemsNotifications');
  }

  if (serverTiming) {
    serverTiming.startTime('getItemsFields');
  }

  const fields = await sendFormsMessage({
    subdomain,
    action: 'fields.find',
    data: {
      query: {
        showInCard: true,
        contentType: `cards:${type}`
      }
    },
    isRPC: true,
    defaultValue: []
  });

  if (serverTiming) {
    serverTiming.endTime('getItemsFields');
  }

  for (const item of list) {
    if (
      item.customFieldsData &&
      item.customFieldsData.length > 0 &&
      fields.length > 0
    ) {
      item.customProperties = [];

      fields.forEach(field => {
        const fieldData = item.customFieldsData.find(
          f => f.field === field._id
        );

        if (fieldData) {
          item.customProperties.push({
            name: `${field.text} - ${fieldData.value}`
          });
        }
      });
    }

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
