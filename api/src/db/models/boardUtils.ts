import {
  ActivityLogs,
  Checklists,
  Companies,
  Conformities,
  Customers,
  Deals,
  GrowthHacks,
  InternalNotes,
  Tasks,
  Tickets,
} from '.';
import { validSearchText } from '../../data/utils';
import { IItemCommonFields, IOrderInput } from './definitions/boards';
import { ICompanyDocument } from './definitions/companies';
import { BOARD_STATUSES, BOARD_TYPES } from './definitions/constants';
import { ICustomerDocument } from './definitions/customers';

interface ISetOrderParam {
  collection: any;
  stageId: string;
  aboveItemId?: string;
}

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

export const getNewOrder = async ({ collection, stageId, aboveItemId }: ISetOrderParam) => {
  const aboveItem = await collection.findOne({ _id: aboveItemId });

  const aboveOrder = aboveItem?.order || 0;

  const belowItems = await collection
    .find({ stageId, order: { $gt: aboveOrder }, status: { $ne: BOARD_STATUSES.ARCHIVED } })
    .sort({ order: 1 })
    .limit(1);

  const belowOrder = belowItems[0]?.order;

  const order = orderHeler(aboveOrder, belowOrder);

  // if duplicated order, then in stages items bulkUpdate 100, 110, 120, 130
  if ([aboveOrder, belowOrder].includes(order)) {
    const bulkOps: Array<{
      updateOne: {
        filter: { _id: string };
        update: { order: number };
      };
    }> = [];

    let ord = 100;

    const allItems = await collection
      .find(
        {
          stageId,
          status: { $ne: BOARD_STATUSES.ARCHIVED },
        },
        { _id: 1, order: 1 },
      )
      .sort({ order: 1 });

    for (const item of allItems) {
      bulkOps.push({
        updateOne: {
          filter: { _id: item._id },
          update: { order: ord },
        },
      });

      ord = ord + 10;
    }

    await collection.bulkWrite(bulkOps);
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
        update: selector,
      },
    });
  }

  await collection.bulkWrite(bulkOps);

  return collection.find({ _id: { $in: ids } }).sort({ order: 1 });
};

export const watchItem = async (collection: any, _id: string, isAdd: boolean, userId: string) => {
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

export const fillSearchTextItem = (doc: IItemCommonFields, item?: IItemCommonFields) => {
  const document = item || { name: '', description: '' };
  Object.assign(document, doc);

  return validSearchText([document.name || '', document.description || '']);
};

export const getCollection = (type: string) => {
  let collection;

  switch (type) {
    case BOARD_TYPES.DEAL: {
      collection = Deals;

      break;
    }
    case BOARD_TYPES.GROWTH_HACK: {
      collection = GrowthHacks;

      break;
    }
    case BOARD_TYPES.TASK: {
      collection = Tasks;

      break;
    }
    case BOARD_TYPES.TICKET: {
      collection = Tickets;

      break;
    }
  }

  return collection;
};

export const getItem = async (type: string, _id: string) => {
  const item = await getCollection(type).findOne({ _id });

  if (!item) {
    throw new Error(`${type} not found`);
  }

  return item;
};

export const getCompanies = async (mainType: string, mainTypeId: string): Promise<ICompanyDocument[]> => {
  const conformities = await Conformities.find({ mainType, mainTypeId, relType: 'company' });

  const companyIds = conformities.map(c => c.relTypeId);

  return Companies.find({ _id: { $in: companyIds } });
};

export const getCustomers = async (mainType: string, mainTypeId: string): Promise<ICustomerDocument[]> => {
  const conformities = await Conformities.find({ mainType, mainTypeId, relType: 'customer' });

  const customerIds = conformities.map(c => c.relTypeId);

  return Customers.find({ _id: { $in: customerIds } });
};

// Removes all board item related things
export const destroyBoardItemRelations = async (contentTypeId: string, contentType: string) => {
  await ActivityLogs.removeActivityLog(contentTypeId);
  await Checklists.removeChecklists(contentType, contentTypeId);
  await Conformities.removeConformity({ mainType: contentType, mainTypeId: contentTypeId });
  await InternalNotes.remove({ contentType, contentTypeId });
};
