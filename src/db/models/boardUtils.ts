import { IOrderInput } from './definitions/boards';

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

export const changeCustomer = async (collection: any, newCustomerId: string, oldCustomerIds: string[]) => {
  if (oldCustomerIds) {
    await collection.updateMany(
      { customerIds: { $in: oldCustomerIds } },
      { $addToSet: { customerIds: newCustomerId } },
    );
    await collection.updateMany(
      { customerIds: { $in: oldCustomerIds } },
      { $pullAll: { customerIds: oldCustomerIds } },
    );
  }

  return collection.find({ customerIds: { $in: oldCustomerIds } });
};

export const changeCompany = async (collection: any, newCompanyId: string, oldCompanyIds: string[]) => {
  if (oldCompanyIds) {
    await collection.updateMany({ companyIds: { $in: oldCompanyIds } }, { $addToSet: { companyIds: newCompanyId } });

    await collection.updateMany({ companyIds: { $in: oldCompanyIds } }, { $pullAll: { companyIds: oldCompanyIds } });
  }

  return collection.find({ customerIds: { $in: oldCompanyIds } });
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
