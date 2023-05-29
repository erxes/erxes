import { validSearchText } from '@erxes/api-utils/src';
import { IItemCommonFields } from './definitions/boards';
import { BOARD_STATUSES, BOARD_TYPES } from './definitions/constants';

import { configReplacer } from '../utils';
import { putActivityLog } from '../logUtils';
import { itemsAdd } from '../graphql/resolvers/mutations/utils';
import { IModels } from '../connectionResolver';
import {
  sendCoreMessage,
  sendInboxMessage,
  sendInternalNotesMessage,
  sendProductsMessage
} from '../messageBroker';

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

export const getCollection = (models: IModels, type: string) => {
  let collection;
  let create;
  let update;
  let remove;

  const { Deals, GrowthHacks, Tasks, Tickets, Purchases, Costs } = models;

  switch (type) {
    case BOARD_TYPES.DEAL: {
      collection = Deals;
      create = Deals.createDeal;
      update = Deals.updateDeal;
      remove = Deals.removeDeals;
      break;
    }
    case BOARD_TYPES.PURCHASE: {
      collection = Purchases;
      create = Purchases.createPurchase;
      update = Purchases.updatePurchase;
      remove = Purchases.removePurchases;
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
    case BOARD_TYPES.COST: {
      collection = Costs;
      create = Costs.createCost;
      update = Costs.updateCost;
      remove = Costs.removeCost;

      break;
    }
    default:
      break;
  }

  return { collection, create, update, remove };
};

export const getItem = async (models: IModels, type: string, doc: any) => {
  const item = await getCollection(models, type).collection.findOne({ ...doc });

  if (!item) {
    throw new Error(`${type} not found`);
  }

  return item;
};

export const getCompanyIds = async (
  subdomain: string,
  mainType: string,
  mainTypeId: string
): Promise<string[]> => {
  const conformities = await sendCoreMessage({
    subdomain,
    action: 'conformities.findConformities',
    data: {
      mainType,
      mainTypeId,
      relType: 'company'
    },
    isRPC: true,
    defaultValue: []
  });

  return conformities.map(c => c.relTypeId);
};

export const getCustomerIds = async (
  subdomain: string,
  mainType: string,
  mainTypeId: string
): Promise<string[]> => {
  const conformities = await sendCoreMessage({
    subdomain,
    action: 'conformities.findConformities',
    data: {
      mainType,
      mainTypeId,
      relType: 'customer'
    },
    isRPC: true,
    defaultValue: []
  });

  return conformities.map(c => c.relTypeId);
};

// Removes all board item related things
export const destroyBoardItemRelations = async (
  models: IModels,
  subdomain: string,
  contentTypeId: string,
  contentType: string
) => {
  await putActivityLog(subdomain, {
    action: 'removeActivityLog',
    data: { contentTypeId }
  });

  await models.Checklists.removeChecklists(contentType, [contentTypeId]);

  sendCoreMessage({
    subdomain,
    action: 'conformities.removeConformity',
    data: {
      mainType: contentType,
      mainTypeId: contentTypeId
    }
  });

  return sendInternalNotesMessage({
    subdomain,
    action: 'deleteMany',
    data: { contentType, contentTypeId }
  });
};

// Get board item link
export const getBoardItemLink = async (
  models: IModels,
  stageId: string,
  itemId: string
) => {
  const stage = await models.Stages.getStage(stageId);
  const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);
  const board = await models.Boards.getBoard(pipeline.boardId);

  return `/${stage.type}/board?id=${board._id}&pipelineId=${pipeline._id}&itemId=${itemId}`;
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

export const boardNumberGenerator = async (
  models: IModels,
  config: string,
  size: string,
  skip: boolean,
  type?: string
) => {
  const replacedConfig = await configReplacer(config);
  const re = replacedConfig + '[0-9]+$';

  let number;

  if (!skip) {
    const pipeline = await models.Pipelines.findOne({
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

export const generateBoardNumber = async (
  models: IModels,
  doc: IItemCommonFields
) => {
  const stage = await models.Stages.getStage(doc.stageId);
  const pipeline = await models.Pipelines.getPipeline(stage.pipelineId);

  if (pipeline.numberSize) {
    const { numberSize, numberConfig = '' } = pipeline;

    const number = await boardNumberGenerator(
      models,
      numberConfig,
      numberSize,
      false,
      pipeline.type
    );

    doc.number = number;
  }

  return { updatedDoc: doc, pipeline };
};

export const createBoardItem = async (
  models: IModels,
  subdomain: string,
  doc: IItemCommonFields,
  type: string
) => {
  const { collection } = await getCollection(models, type);

  const response = await generateBoardNumber(models, doc);

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
    if (e.message.includes(`E11000 duplicate key error`)) {
      await createBoardItem(models, subdomain, doc, type);
    } else {
      throw new Error(e.message);
    }
  }

  // update numberConfig of the same configed pipelines
  if (doc.number) {
    await models.Pipelines.updateMany(
      {
        numberConfig: pipeline.numberConfig,
        type: pipeline.type
      },
      { $set: { lastNum: doc.number } }
    );
  }

  let action = 'create';
  let content = '';

  if (doc.sourceConversationIds && doc.sourceConversationIds.length > 0) {
    action = 'convert';
    content = item.sourceConversationIds.slice(-1)[0];
  }

  // create log
  await putActivityLog(subdomain, {
    action: 'createBoardItem',
    data: {
      item,
      contentType: type,
      action,
      content,
      createdBy: item.userId || '',
      contentId: item._id
    }
  });

  return item;
};

// check booking convert
const checkBookingConvert = async (subdomain: string, productId: string) => {
  const product = await sendProductsMessage({
    subdomain,
    action: 'findOne',
    data: { _id: productId },
    isRPC: true
  });

  let dealUOM = await sendCoreMessage({
    subdomain,
    action: 'configs.getValues',
    data: {
      code: 'dealUOM'
    },
    isRPC: true,
    defaultValue: []
  });

  let dealCurrency = await sendCoreMessage({
    subdomain,
    action: 'configs.getValues',
    data: {
      code: 'dealCurrency'
    },
    isRPC: true,
    defaultValue: []
  });

  if (dealUOM.length > 0) {
    dealUOM = dealUOM[0];
  } else {
    throw new Error('Please choose UNIT OF MEASUREMENT from general settings!');
  }

  if (dealCurrency.length > 0) {
    dealCurrency = dealCurrency[0];
  } else {
    throw new Error('Please choose currency from general settings!');
  }

  return {
    product,
    dealUOM,
    dealCurrency
  };
};

export const conversationConvertToCard = async (
  models: IModels,
  subdomain: string,
  args
) => {
  const {
    _id,
    type,
    itemId,
    itemName,
    stageId,
    bookingProductId,
    conversation,
    user
  } = args;

  const { collection, create, update } = getCollection(models, type);

  if (itemId) {
    const oldItem = await collection.findOne({ _id: itemId }).lean();

    if (bookingProductId) {
      const { product, dealUOM, dealCurrency } = await checkBookingConvert(
        subdomain,
        bookingProductId
      );

      oldItem.productsData.push({
        _id: product._id,
        productId: product._id,
        unitPrice: product.unitPrice,
        uom: dealUOM,
        currency: dealCurrency,
        quantity: product.productCount
      });
    }

    const doc = { ...oldItem, ...args };

    if (conversation.assignedUserId) {
      const assignedUserIds = oldItem.assignedUserIds || [];
      assignedUserIds.push(conversation.assignedUserId);

      doc.assignedUserIds = [
        ...new Set([...assignedUserIds, ...args.assignedUserIds])
      ];
    }

    const sourceConversationIds: string[] = oldItem.sourceConversationIds || [];

    sourceConversationIds.push(conversation._id);

    doc.sourceConversationIds = sourceConversationIds;

    delete doc._id;
    const item = await update(oldItem._id, doc);

    item.userId = user._id;

    await putActivityLog(subdomain, {
      action: 'createBoardItem',
      data: {
        item,
        contentType: type,
        action: 'convert',
        content: conversation._id,
        createdBy: item.userId || '',
        contentId: item._id
      }
    });

    const relTypeIds: string[] = [];

    sourceConversationIds.forEach(async conversationId => {
      const con = await sendInboxMessage({
        subdomain,
        action: 'getConversation',
        data: {
          conversationId
        },
        isRPC: true,
        defaultValue: {}
      });

      if (con.customerId) {
        relTypeIds.push(con.customerId);
      }
    });

    if (conversation.customerId) {
      await sendCoreMessage({
        subdomain,
        action: 'conformities.addConformity',
        data: {
          mainType: type,
          mainTypeId: item._id,
          relType: 'customer',
          relTypeId: conversation.customerId
        },
        isRPC: true
      });
    }

    return item._id;
  } else {
    const doc: any = { ...args };

    doc.name = itemName;
    doc.stageId = stageId;
    doc.sourceConversationIds = [_id];
    doc.customerIds = [conversation.customerId];

    if (bookingProductId) {
      const { product, dealUOM, dealCurrency } = await checkBookingConvert(
        subdomain,
        bookingProductId
      );

      doc.productsData = [
        {
          _id: product._id,
          productId: product._id,
          unitPrice: product.unitPrice,
          uom: dealUOM,
          currency: dealCurrency,
          quantity: product.productCount
        }
      ];
    }

    const item = await itemsAdd(models, subdomain, doc, type, create, user);

    return item._id;
  }
};
