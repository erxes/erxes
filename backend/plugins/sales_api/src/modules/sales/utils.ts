import { IUserDocument } from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  getNextMonth,
  getToday,
  regexSearchText,
  sendTRPCMessage,
  validSearchText,
} from 'erxes-api-shared/utils';
import moment from 'moment';
import { IModels } from '~/connectionResolvers';
import {
  IArchiveArgs,
  IDeal,
  IDealDocument,
  IDealQueryParams,
  IPipeline,
  IProductData,
  IStageDocument,
} from './@types';
import { CLOSE_DATE_TYPES, SALES_STATUSES } from './constants';
import { generateFilter } from './graphql/resolvers/queries/deals';

export const configReplacer = (config) => {
  const now = new Date();

  // replace type of date
  return config
    .replace(/\{year}/g, now.getFullYear().toString())
    .replace(/\{month}/g, `0${(now.getMonth() + 1).toString()}`.slice(-2))
    .replace(/\{day}/g, `0${now.getDate().toString()}`.slice(-2));
};

// board item number calculator
const numberCalculator = (size: number, num?: any, skip?: boolean) => {
  if (num && !skip) {
    num = parseInt(num, 10) + 1;
  }

  if (skip) {
    num = 0;
  }

  num = num.toString();

  while (num.length < size) {
    num = '0' + num;
  }

  return num;
};

export const watchItem = async (
  collection: any,
  _id: string,
  isAdd: boolean,
  userId: string,
) => {
  const item = await collection.findOne({ _id });

  const watchedUserIds = item.watchedUserIds || [];

  if (isAdd) {
    watchedUserIds.push(userId);
  } else {
    const index = watchedUserIds.indexOf(userId);

    watchedUserIds.splice(index, 1);
  }

  await collection.updateOne({ _id }, { $set: { watchedUserIds } });

  return collection.findOne({ _id });
};

export const boardNumberGenerator = async (
  models: IModels,
  config: string,
  size: string,
  skip: boolean,
  type?: string,
) => {
  const replacedConfig = await configReplacer(config);
  const re = replacedConfig + '[0-9]+$';

  let number;

  if (!skip) {
    const pipeline = await models.Pipelines.findOne({
      lastNum: new RegExp(re),
      type,
    });

    if (pipeline?.lastNum) {
      const lastNum = pipeline.lastNum;

      const lastGeneratedNumber = lastNum.slice(replacedConfig.length);

      number =
        replacedConfig +
        (await numberCalculator(parseInt(size, 10), lastGeneratedNumber));

      return number;
    }
  }

  number =
    replacedConfig + (await numberCalculator(parseInt(size, 10), '', skip));

  return number;
};

export const fillSearchTextItem = (doc: IDeal, item?: IDealDocument) => {
  const document = item || { name: '', description: '' };
  Object.assign(document, doc);

  return validSearchText([document.name || '', document.description || '']);
};

export const generateBoardNumber = async (models: IModels, doc: IDeal) => {
  const stage = await models.Stages.getStage(doc.stageId);
  const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

  if (pipeline.numberSize) {
    const { numberSize, numberConfig = '' } = pipeline;

    const number = await boardNumberGenerator(
      models,
      numberConfig,
      numberSize,
      false,
      pipeline.type,
    );

    doc.number = number;
  }

  return { updatedDoc: doc, pipeline };
};

export const createBoardItem = async (models: IModels, doc: IDeal) => {
  const response = await generateBoardNumber(models, doc);

  const { pipeline, updatedDoc } = response;

  let item;

  try {
    item = await models.Deals.create({
      ...updatedDoc,
      stageChangedDate: new Date(),
      searchText: fillSearchTextItem(doc),
    });
  } catch (e) {
    if (e.message.includes(`E11000 duplicate key error`)) {
      console.log(doc.number, doc.stageId);
      await createBoardItem(models, doc);
    } else {
      throw new Error(e.message);
    }
  }

  // update numberConfig of the same configed pipelines
  if (doc.number) {
    await models.Pipelines.updateMany(
      {
        numberConfig: pipeline.numberConfig,
        type: pipeline.type,
      },
      { $set: { lastNum: doc.number } },
    );
  }

  //   let action = 'create';
  //   let content = '';

  //   if (doc.sourceConversationIds && doc.sourceConversationIds.length > 0) {
  //     action = 'convert';
  //     content = item.sourceConversationIds.slice(-1)[0];
  //   }

  //   // create log
  //   await putActivityLog(subdomain, {
  //     action: 'createBoardItem',
  //     data: {
  //       item,
  //       contentType: type,
  //       action,
  //       content,
  //       createdBy: item.userId || '',
  //       contentId: item._id,
  //     },
  //   });

  return item;
};


export const generateLastNum = async (models: IModels, doc: IPipeline) => {
  const replacedConfig = await configReplacer(doc.numberConfig);
  const re = replacedConfig + '[0-9]+$';

  const pipeline = await models.Pipelines.findOne({
    lastNum: new RegExp(re),
    type: doc.type,
  });

  if (pipeline) {
    return pipeline.lastNum || '';
  }

  const item = await models.Deals.findOne({
    number: new RegExp(re),
  }).sort({ createdAt: -1 });

  if (item) {
    return item.number;
  }

  // generate new number by new numberConfig
  return await boardNumberGenerator(
    models,
    doc.numberConfig ?? '',
    doc.numberSize ?? '',
    true,
    'lastNum',
  );
};


// Removes all board item related things
export const destroyBoardItemRelations = async (
  models: IModels,
  contentTypeId: string,
) => {
  //   await putActivityLog(subdomain, {
  //     action: 'removeActivityLog',
  //     data: { contentTypeId },
  //   });

  await models.Checklists.removeChecklists([contentTypeId]);

  //   await sendCoreMessage({
  //     subdomain,
  //     action: 'conformities.removeConformity',
  //     data: {
  //       mainType: contentType,
  //       mainTypeId: contentTypeId,
  //     },
  //   });

  //   await sendCoreMessage({
  //     subdomain,
  //     action: 'removeInternalNotes',
  //     data: {
  //       contentType: `sales:${contentType}`,
  //       contentTypeIds: [contentTypeId],
  //     },
  //   });
};

export const getCloseDateByType = (closeDateType: string) => {
  if (closeDateType === CLOSE_DATE_TYPES.NEXT_DAY) {
    const tommorrow = moment().add(1, 'days');

    return {
      $gte: new Date(tommorrow.startOf('day').toISOString()),
      $lte: new Date(tommorrow.endOf('day').toISOString()),
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
      $lte: new Date(nextSunday),
    };
  }

  if (closeDateType === CLOSE_DATE_TYPES.NEXT_MONTH) {
    const now = new Date();
    const { start, end } = getNextMonth(now);

    return {
      $gte: new Date(start),
      $lte: new Date(end),
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

const generateArchivedItemsFilter = (
  params: IArchiveArgs,
  stages: IStageDocument[],
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
    hackStages,
  } = params;

  const filter: any = { status: SALES_STATUSES.ARCHIVED };

  filter.stageId = { $in: stages.map((stage) => stage._id) };

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
      $gte: new Date(startDate),
    };
  }

  if (endDate) {
    if (filter.closeDate) {
      filter.closeDate.$lte = new Date(endDate);
    } else {
      filter.closeDate = {
        $lte: new Date(endDate),
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

export const archivedItems = async (models: IModels, params: IArchiveArgs) => {
  const { pipelineId } = params;

  const stages = await models.Stages.find({ pipelineId }).lean();

  if (stages.length > 0) {
    const filter = generateArchivedItemsFilter(params, stages);

    const { list, pageInfo, totalCount } = await cursorPaginate({
      model: models.Deals,
      params,
      query: filter,
    });

    return { list, pageInfo, totalCount };
  }

  return {};
};

export const archivedItemsCount = async (
  models: IModels,
  params: IArchiveArgs,
  collection: any,
) => {
  const { pipelineId } = params;

  const stages = await models.Stages.find({ pipelineId });

  if (stages.length > 0) {
    const filter = generateArchivedItemsFilter(params, stages);

    return collection.find(filter).countDocuments();
  }

  return 0;
};

export const checkItemPermByUser = async (
  models: IModels,
  user: any,
  deal: IDeal,
) => {
  const stage = await models.Stages.getStage(deal.stageId);

  const {
    visibility,
    memberIds,
    departmentIds = [],
    branchIds = [],
    isCheckUser,
    excludeCheckUserIds,
  } = await models.Pipelines.getPipeline(stage.pipelineId);

  const supervisorDepartments = await sendTRPCMessage({
    pluginName: 'core',
    method: 'query',
    module: 'departments',
    action: 'findWithChild',
    input: {
      query: {
        supervisorId: user?._id,
      },
      fields: {
        _id: 1,
      },
    },
    defaultValue: [],
  });

  const supervisorDepartmentIds =
    supervisorDepartments?.map((x) => x._id) || [];
  const userDepartmentIds = user.departmentIds || [];
  const userBranchIds = user?.branchIds || [];

  // check permission on department
  const hasUserInDepartment = compareDepartmentIds(departmentIds, [
    ...userDepartmentIds,
    ...supervisorDepartmentIds,
  ]);
  const isUserInBranch = compareDepartmentIds(branchIds, userBranchIds);

  // if (
  //   visibility === 'private' &&
  //   !(memberIds || []).includes(user._id) &&
  //   !hasUserInDepartment &&
  //   !isUserInBranch &&
  //   user?.role !== USER_ROLES.SYSTEM
  // ) {
  //   throw new Error('You do not have permission to view.');
  // }

  const isSuperVisorInDepartment = compareDepartmentIds(
    departmentIds,
    supervisorDepartmentIds,
  );
  if (isSuperVisorInDepartment) {
    return deal;
  }

  // pipeline is Show only the users assigned(created) cards checked
  // and current user nothing dominant users
  // current user hans't this carts assigned and created
  if (
    isCheckUser &&
    !(excludeCheckUserIds || []).includes(user._id) &&
    !(
      (deal.assignedUserIds || []).includes(user._id) ||
      deal.userId === user._id
    )
  ) {
    throw new Error('You do not have permission to view.');
  }

  return deal;
};

export const getItemList = async (
  models: IModels,
  filter: any,
  args: IDealQueryParams,
  user: IUserDocument,
  getExtraFields?: (item: any) => { [key: string]: any },
) => {
  const { list, pageInfo, totalCount } = await cursorPaginate<IDealDocument>({
    model: models.Deals,
    params: args,
    query: filter,
  });

  // const ids = list.map((item) => item._id);

  // const conformities = await sendCoreMessage({
  //   subdomain,
  //   action: 'conformities.getConformities',
  //   data: {
  //     mainType: type,
  //     mainTypeIds: ids,
  //     relTypes: ['company', 'customer'],
  //   },
  //   isRPC: true,
  //   defaultValue: [],
  // });

  const companyIds: string[] = [];
  const customerIds: string[] = [];
  const companyIdsByItemId = {};
  const customerIdsByItemId = {};

  // const perConformity = (
  //   conformity,
  //   cocIdsByItemId,
  //   cocIds,
  //   typeId1,
  //   typeId2,
  // ) => {
  //   cocIds.push(conformity[typeId1]);

  //   if (!cocIdsByItemId[conformity[typeId2]]) {
  //     cocIdsByItemId[conformity[typeId2]] = [];
  //   }

  //   cocIdsByItemId[conformity[typeId2]].push(conformity[typeId1]);
  // };

  // for (const conf of conformities) {
  //   if (conf.mainType === 'company') {
  //     perConformity(
  //       conf,
  //       companyIdsByItemId,
  //       companyIds,
  //       'mainTypeId',
  //       'relTypeId',
  //     );
  //     continue;
  //   }
  //   if (conf.relType === 'company') {
  //     perConformity(
  //       conf,
  //       companyIdsByItemId,
  //       companyIds,
  //       'relTypeId',
  //       'mainTypeId',
  //     );
  //     continue;
  //   }
  //   if (conf.mainType === 'customer') {
  //     perConformity(
  //       conf,
  //       customerIdsByItemId,
  //       customerIds,
  //       'mainTypeId',
  //       'relTypeId',
  //     );
  //     continue;
  //   }
  //   if (conf.relType === 'customer') {
  //     perConformity(
  //       conf,
  //       customerIdsByItemId,
  //       customerIds,
  //       'relTypeId',
  //       'mainTypeId',
  //     );
  //     continue;
  //   }
  // }

  const companies = await sendTRPCMessage({
    pluginName: 'core',
    method: 'query',
    module: 'companies',
    action: 'findActiveCompanies',
    input: {
      query: {
        _id: { $in: [...new Set(companyIds)] },
      },
      fields: {
        primaryName: 1,
        primaryEmail: 1,
        primaryPhone: 1,
        emails: 1,
        phones: 1,
      },
    },
    defaultValue: [],
  });

  const customers = await sendTRPCMessage({
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'findActiveCustomers',
    input: {
      query: {
        _id: { $in: [...new Set(customerIds)] },
      },
      fields: {
        firstName: 1,
        lastName: 1,
        middleName: 1,
        visitorContactInfo: 1,
        primaryEmail: 1,
        primaryPhone: 1,
        emails: 1,
        phones: 1,
      },
    },
    defaultValue: [],
  });

  const getCocsByItemId = (
    itemId: string,
    cocIdsByItemId: any,
    cocs: any[],
  ) => {
    const cocIds = cocIdsByItemId[itemId] || [];

    return cocIds.flatMap((cocId: string) => {
      const found = cocs.find((coc) => cocId === coc._id);

      return found || [];
    });
  };

  const updatedList: any[] = [];

  // const notifications = await sendNotificationsMessage({
  //   subdomain,
  //   action: 'find',
  //   data: {
  //     selector: {
  //       contentTypeId: { $in: ids },
  //       isRead: false,
  //       receiver: user._id
  //     },
  //     fields: { contentTypeId: 1 }
  //   },
  //   isRPC: true,
  //   defaultValue: []
  // });

  const fields = await sendTRPCMessage({
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'find',
    input: {
      query: {
        showInCard: true,
        contentType: `sales:deal`,
      },
    },
    defaultValue: [],
  });

  // add just incremented order to each item in list, not from db
  let order = 0;
  for (const item of list) {
    if (item.customFieldsData?.length && fields?.length) {
      item.customProperties = [];

      fields.forEach((field) => {
        const fieldData = (item.customFieldsData || []).find(
          (f) => f.field === field._id,
        );

        if (item.customProperties && fieldData) {
          item.customProperties.push({
            name: `${field.text} - ${fieldData.value}`,
          });
        }
      });
    }

    // const notification = notifications.find(n => n.contentTypeId === item._id);

    updatedList.push({
      ...item,
      order: order++,
      isWatched: (item.watchedUserIds || []).includes(user._id),
      // hasNotified: notification ? false : true,
      customers: getCocsByItemId(item._id, customerIdsByItemId, customers),
      companies: getCocsByItemId(item._id, companyIdsByItemId, companies),
      ...(getExtraFields ? await getExtraFields(item) : {}),
    });
  }

  return { list: updatedList, pageInfo, totalCount };
};

// comparing pipelines departmentIds and current user departmentIds
const compareDepartmentIds = (
  pipelineDepartmentIds: string[],
  userDepartmentIds: string[],
): boolean => {
  if (!pipelineDepartmentIds?.length || !userDepartmentIds?.length) {
    return false;
  }

  for (const uDepartmentId of userDepartmentIds) {
    if (pipelineDepartmentIds.includes(uDepartmentId)) {
      return true;
    }
  }

  return false;
};

export const generateAmounts = (productsData, useTick = true) => {
  const amountsMap = {};

  (productsData || []).forEach((product) => {
    // Tick paid or used is false then exclude
    if (useTick && !product.tickUsed) {
      return;
    }

    if (!useTick && product.tickUsed) {
      return;
    }

    const type = product.currency;

    if (type) {
      if (!amountsMap[type]) {
        amountsMap[type] = 0;
      }

      amountsMap[type] += product.amount || 0;
    }
  });

  return amountsMap;
};

export const checkNumberConfig = async (
  numberConfig: string,
  numberSize: string,
) => {
  if (!numberConfig) {
    throw new Error('Please input number configuration.');
  }

  if (!numberSize) {
    throw new Error('Please input fractional part.');
  }

  const replaced = await configReplacer(numberConfig);
  const re = /[0-9]$/;

  if (re.test(replaced)) {
    throw new Error(
      `Please make sure that the number configuration itself doesn't end with any number.`,
    );
  }

  return;
};

export const bulkUpdateOrders = async ({
  collection,
  stageId,
  sort = { order: 1 },
  additionFilter = {},
  startOrder = 100,
}: {
  collection: any;
  stageId: string;
  sort?: { [key: string]: any };
  additionFilter?: any;
  startOrder?: number;
}) => {
  const bulkOps: Array<{
    updateOne: {
      filter: { _id: string };
      update: { order: number };
    };
  }> = [];

  let ord = startOrder;

  const allItems = await collection
    .find(
      {
        stageId,
        status: { $ne: SALES_STATUSES.ARCHIVED },
        ...additionFilter,
      },
      { _id: 1, order: 1 },
    )
    .sort(sort);

  for (const item of allItems) {
    bulkOps.push({
      updateOne: {
        filter: { _id: item._id },
        update: { order: ord },
      },
    });

    ord += 10;
  }

  if (!bulkOps.length) {
    return '';
  }

  await collection.bulkWrite(bulkOps);
  return 'ok';
};

const randomBetween = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

const orderHeler = (aboveOrder, belowOrder) => {
  // empty stage
  if (!aboveOrder && !belowOrder) {
    return 100;
  }

  // end of stage
  if (!belowOrder) {
    return aboveOrder + 10;
  }

  // begin of stage
  if (!aboveOrder) {
    return randomBetween(0, belowOrder);
  }

  // between items on stage
  return randomBetween(aboveOrder, belowOrder);
};

export const getNewOrder = async ({
  collection,
  stageId,
  aboveItemId,
}: {
  collection: any;
  stageId: string;
  aboveItemId?: string;
}) => {
  const aboveItem = await collection.findOne({ _id: aboveItemId });

  const aboveOrder = aboveItem?.order || 0;

  const belowItems = await collection
    .find({
      stageId,
      order: { $gt: aboveOrder },
      status: { $ne: SALES_STATUSES.ARCHIVED },
    })
    .sort({ order: 1 })
    .limit(1);

  const belowOrder = belowItems[0]?.order;

  const order = orderHeler(aboveOrder, belowOrder);

  // if duplicated order, then in stages items bulkUpdate 100, 110, 120, 130
  if ([aboveOrder, belowOrder].includes(order)) {
    await bulkUpdateOrders({ collection, stageId });

    return getNewOrder({ collection, stageId, aboveItemId });
  }

  return order;
};

export const checkMovePermission = (
  stage: IStageDocument,
  user: IUserDocument,
) => {
  if (
    stage.canMoveMemberIds &&
    stage.canMoveMemberIds.length > 0 &&
    !stage.canMoveMemberIds.includes(user._id)
  ) {
    throw new Error('Permission denied');
  }
};

export const getAmountsMap = async (
  models,
  collection,
  user,
  args,
  stage,
  tickUsed = true,
) => {
  const amountsMap = {};
  const filter = await generateFilter(
    models,
    user._id,
    { ...args, ...args.extraParams, stageId: stage._id, pipelineId: stage.pipelineId },
  );

  const amountList = await collection.aggregate([
    {
      $match: filter,
    },
    {
      $unwind: '$productsData',
    },
    {
      $project: {
        amount: '$productsData.amount',
        currency: '$productsData.currency',
        tickUsed: '$productsData.tickUsed',
      },
    },
    {
      $match: { tickUsed },
    },
    {
      $group: {
        _id: '$currency',
        amount: { $sum: '$amount' },
      },
    },
  ]);

  amountList.forEach((item) => {
    if (item._id) {
      amountsMap[item._id] = item.amount;
    }
  });
  return amountsMap;
};

interface IMainType {
  mainType: string;
  mainTypeId: string;
}

export interface IConformityAdd extends IMainType {
  relType: string;
  relTypeId: string;
}

interface IConformityCreate extends IMainType {
  companyIds?: string[];
  customerIds?: string[];
}

export const getCompanyIds = async (
  mainType: string,
  mainTypeId: string
): Promise<string[]> => {
  return await sendTRPCMessage({
    pluginName: 'core',
    module: 'conformity',
    action: 'savedConformity',
    input: {
      mainType,
      mainTypeId,
      relTypes: ['company']
    },
    defaultValue: [],
  });
};

export const getCustomerIds = async (
  mainType: string,
  mainTypeId: string
): Promise<string[]> => {
  return await sendTRPCMessage({
    pluginName: 'core',
    module: 'conformity',
    action: 'savedConformity',
    input: {
      mainType,
      mainTypeId,
      relTypes: ['company']
    },
    defaultValue: [],
  });
};


export const createConformity = async (
  { companyIds, customerIds, mainType, mainTypeId }: IConformityCreate
) => {
  const companyConformities: IConformityAdd[] = (companyIds || []).map(
    companyId => ({
      mainType,
      mainTypeId,
      relType: "company",
      relTypeId: companyId
    })
  );

  const customerConformities: IConformityAdd[] = (customerIds || []).map(
    customerId => ({
      mainType,
      mainTypeId,
      relType: "customer",
      relTypeId: customerId
    })
  );

  const allConformities = companyConformities.concat(customerConformities);
  if (allConformities.length) {
    await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'core',
      module: 'conformity',
      action: "addConformities",
      input: allConformities
    });
  }
};

export const getTotalAmounts = async (productsData: IProductData[]) => {
  // TODO: future list by currency
  const result = {
    totalAmount: 0,
    unUsedTotalAmount: 0,
    bothTotalAmount: 0,
  }

  for (const pData of productsData) {
    result.bothTotalAmount += pData.amount ?? 0;

    if (pData.tickUsed) {
      result.totalAmount += pData.amount ?? 0;
    } else {
      result.unUsedTotalAmount += pData.amount ?? 0;
    }
  }
  return result;
}

export const convertNestedDate = (obj: any) => {
  if (typeof obj !== "object" || obj === null) return obj;

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Check if the key is one of the target comparison operators
      if (
        ["$gte", "$lte", "$gt", "$lt"].includes(key) &&
        typeof obj[key] === "string"
      ) {
        obj[key] = new Date(obj[key]); // Convert value to Date
      } else if (typeof obj[key] === "object") {
        // Recursively process nested objects
        obj[key] = convertNestedDate(obj[key]);
      }
    }
  }

  return obj;
};
