import { validSearchText } from '../../data/utils';
import { IItemCommonFields, IOrderInput } from './definitions/boards';

export const updateOrder = async (collection: any, orders: IOrderInput[], stageId?: string) => {
  if (orders.length === 0) {
    return [];
  }

  const ids: string[] = [];
  const bulkOps: Array<{
    updateOne: {
      filter: { _id: string };
      update: { stageId?: string; order: number };
    };
  }> = [];

  for (const { _id, order } of orders) {
    ids.push(_id);

    const selector: { order: number; stageId?: string } = { order };

    if (stageId) {
      selector.stageId = stageId;
    }

    bulkOps.push({
      updateOne: {
        filter: { _id },
        update: selector,
      },
    });
  }

  if (bulkOps) {
    await collection.bulkWrite(bulkOps);
  }

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
  const document = item || {};
  Object.assign(document, doc);

  return validSearchText([document.name || '', document.description || '']);
};
