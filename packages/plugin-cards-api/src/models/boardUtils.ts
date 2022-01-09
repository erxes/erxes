import {
  Boards,
  Checklists,
  Conformities,
  Deals,
  GrowthHacks,
  InternalNotes,
  Pipelines,
  Stages,
  Tasks,
  Tickets
} from '.';
import { ACTIVITY_LOG_ACTIONS, putActivityLog } from '../../data/logUtils';
import {
  configReplacer,
  numberCalculator,
  validSearchText
} from '../../data/utils';
import { IItemCommonFields, IOrderInput } from './definitions/boards';
import { BOARD_STATUSES, BOARD_TYPES } from './definitions/constants';

interface ISetOrderParam {
  collection: any;
  stageId: string;
  aboveItemId?: string;
}

export const bulkUpdateOrders = async ({
  collection,
  stageId,
  sort = { order: 1 },
  additionFilter = {},
  startOrder = 100
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
        status: { $ne: BOARD_STATUSES.ARCHIVED },
        ...additionFilter
      },
      { _id: 1, order: 1 }
    )
    .sort(sort);

  for (const item of allItems) {
    bulkOps.push({
      updateOne: {
        filter: { _id: item._id },
        update: { order: ord }
      }
    });

    ord = ord + 10;
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
  aboveItemId
}: ISetOrderParam) => {
  const aboveItem = await collection.findOne({ _id: aboveItemId });

  const aboveOrder = aboveItem?.order || 0;

  const belowItems = await collection
    .find({
      stageId,
      order: { $gt: aboveOrder },
      status: { $ne: BOARD_STATUSES.ARCHIVED }
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

export const updateOrder = async (collection: any, orders: IOrderInput[]) => {
  if (orders.length === 0) {
    return [];
  }

  const ids: string[] = [];
  const bulkOps: Array<{
    updateOne: {
      filter: { _id: string };
      update: { order: number };
    };
  }> = [];

  for (const { _id, order } of orders) {
    ids.push(_id);

    const selector: { order: number } = { order };

    bulkOps.push({
      updateOne: {
        filter: { _id },
        update: selector
      }
    });
  }

  await collection.bulkWrite(bulkOps);

  return collection.find({ _id: { $in: ids } }).sort({ order: 1 });
};

export const watchItem = async (
  collection: any,
  _id: string,
  isAdd: boolean,
  userId: string
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

export const fillSearchTextItem = (
  doc: IItemCommonFields,
  item?: IItemCommonFields
) => {
  const document = item || { name: '', description: '' };
  Object.assign(document, doc);

  return validSearchText([document.name || '', document.description || '']);
};

export const getCollection = (type: string) => {
  let collection;
  let create;
  let update;
  let remove;

  switch (type) {
    case BOARD_TYPES.DEAL: {
      collection = Deals;
      create = Deals.createDeal;
      update = Deals.updateDeal;
      remove = Deals.removeDeals;
      break;
    }
    case BOARD_TYPES.GROWTH_HACK: {
      collection = GrowthHacks;
      create = GrowthHacks.createGrowthHack;
      update = GrowthHacks.updateGrowthHack;
      break;
    }
    case BOARD_TYPES.TASK: {
      collection = Tasks;
      create = Tasks.createTask;
      update = Tasks.updateTask;
      remove = Tasks.removeTasks;
      break;
    }
    case BOARD_TYPES.TICKET: {
      collection = Tickets;
      create = Tickets.createTicket;
      update = Tickets.updateTicket;
      remove = Tickets.removeTickets;
      break;
    }
  }

  return { collection, create, update, remove };
};

export const getItem = async (type: string, doc: any) => {
  const item = await getCollection(type).collection.findOne({ ...doc });

  if (!item) {
    throw new Error(`${type} not found`);
  }

  return item;
};

export const getCompanyIds = async (
  mainType: string,
  mainTypeId: string
): Promise<string[]> => {
  const conformities = await Conformities.find({
    mainType,
    mainTypeId,
    relType: 'company'
  }).lean();

  return conformities.map(c => c.relTypeId);
};

export const getCustomerIds = async (
  mainType: string,
  mainTypeId: string
): Promise<string[]> => {
  const conformities = await Conformities.find({
    mainType,
    mainTypeId,
    relType: 'customer'
  }).lean();

  return conformities.map(c => c.relTypeId);
};

// Removes all board item related things
export const destroyBoardItemRelations = async (
  contentTypeId: string,
  contentType: string
) => {
  await putActivityLog({
    action: ACTIVITY_LOG_ACTIONS.REMOVE_ACTIVITY_LOG,
    data: { contentTypeId }
  });

  await Checklists.removeChecklists(contentType, [contentTypeId]);
  await Conformities.removeConformity({
    mainType: contentType,
    mainTypeId: contentTypeId
  });
  await InternalNotes.deleteMany({ contentType, contentTypeId });
};

// Get board item link
export const getBoardItemLink = async (stageId: string, itemId: string) => {
  const stage = await Stages.getStage(stageId);
  const pipeline = await Pipelines.getPipeline(stage.pipelineId);
  const board = await Boards.getBoard(pipeline.boardId);

  return `/${stage.type}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${itemId}`;
};

export const boardNumberGenerator = async (
  config: string,
  size: string,
  skip: boolean,
  type?: string
) => {
  const replacedConfig = await configReplacer(config);
  const re = replacedConfig + '[0-9]+$';

  let number;

  if (!skip) {
    const pipeline = await Pipelines.findOne({
      lastNum: new RegExp(re),
      type
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

export const generateBoardNumber = async (doc: IItemCommonFields) => {
  const stage = await Stages.getStage(doc.stageId);
  const pipeline = await Pipelines.getPipeline(stage.pipelineId);

  if (pipeline.numberSize) {
    const { numberSize, numberConfig = '' } = pipeline;

    const number = await boardNumberGenerator(
      numberConfig,
      numberSize,
      false,
      pipeline.type
    );

    doc.number = number;
  }

  return { updatedDoc: doc, pipeline };
};

export const createBoardItem = async (doc: IItemCommonFields, type: string) => {
  const { collection } = await getCollection(type);

  const response = await generateBoardNumber(doc);

  const { pipeline, updatedDoc } = response;

  let item;

  try {
    item = await collection.create({
      ...updatedDoc,
      createdAt: new Date(),
      modifiedAt: new Date(),
      stageChangedDate: new Date(),
      searchText: fillSearchTextItem(doc)
    });
  } catch (e) {
    if (
      e.message === `E11000 duplicate key error dup key: { : "${doc.number}" }`
    ) {
      await createBoardItem(doc, type);
    }
  }

  // update numberConfig of the same configed pipelines
  if (doc.number) {
    await Pipelines.updateMany(
      {
        numberConfig: pipeline.numberConfig,
        type: pipeline.type
      },
      { $set: { lastNum: doc.number } }
    );
  }

  // create log
  await putActivityLog({
    action: ACTIVITY_LOG_ACTIONS.CREATE_BOARD_ITEM,
    data: { item, contentType: type }
  });

  return item;
};
