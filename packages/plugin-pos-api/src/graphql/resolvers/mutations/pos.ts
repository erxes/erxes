import messageBroker, { sendEbarimtMessage } from '../../../messageBroker';
import { checkPermission } from '@erxes/api-utils/src/permissions';
import { getConfig } from '../../../utils';
import { IContext } from '../../../connectionResolver';
import { IPos, IPosSlot } from '../../../models/definitions/pos';
import { orderDeleteToErkhet, orderToErkhet } from '../../../utils';
import {
  syncPosToClient,
  syncProductGroupsToClient,
  syncSlotsToClient
} from './utils';

interface IPOSEdit extends IPos {
  _id: string;
}

const mutations = {
  posAdd: async (
    _root,
    params: IPos,
    { models, user, subdomain }: IContext
  ) => {
    const pos = await models.Pos.posAdd(user, params);

    const { ALL_AUTO_INIT } = process.env;
    if (
      [true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '') ||
      pos.isOnline
    ) {
      await syncPosToClient(subdomain, pos);
    }

    return pos;
  },

  posEdit: async (
    _root,
    { _id, ...doc }: IPOSEdit,
    { models, subdomain }: IContext
  ) => {
    await models.Pos.getPos({ _id });
    const updatedDocument = await models.Pos.posEdit(_id, { ...doc });

    await syncPosToClient(subdomain, updatedDocument);

    return updatedDocument;
  },

  posRemove: async (_root, { _id }: { _id: string }, { models }: IContext) => {
    return await models.Pos.posRemove(_id);
  },

  productGroupsBulkInsert: async (
    _root,
    { posId, groups }: { posId: string; groups: any[] },
    { models, subdomain }: IContext
  ) => {
    const pos = await models.Pos.getPos({ _id: posId });

    const dbGroups = await models.ProductGroups.groups(posId);
    const groupsToAdd = [] as any;
    const groupsToUpdate = [] as any;
    for (const group of groups) {
      if (group._id.includes('temporaryId')) {
        delete group._id;
        groupsToAdd.push({ ...group, posId });
      } else {
        groupsToUpdate.push(group);
        await models.ProductGroups.groupsEdit(group._id, group);
      }
    }
    const groupsToRemove = dbGroups.filter(el => {
      const index = groupsToUpdate.findIndex(g => g._id === el._id);
      if (index === -1) {
        return el._id;
      }
    });
    if (groupsToRemove.length > 0) {
      await models.ProductGroups.deleteMany({ _id: { $in: groupsToRemove } });
    }
    await models.ProductGroups.insertMany(groupsToAdd);

    const updatedGroups = await models.ProductGroups.groups(posId);

    const { ALL_AUTO_INIT } = process.env;
    if (
      [true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '') ||
      pos.isOnline
    ) {
      await syncProductGroupsToClient(subdomain, models, pos);
    }

    return updatedGroups;
  },

  posSlotBulkUpdate: async (
    _root,
    { posId, slots }: { posId: string; slots: IPosSlot[] },
    { models, subdomain }: IContext
  ) => {
    const pos = await models.Pos.getPos({ _id: posId });

    const oldPosSlots = await models.PosSlots.find({ posId });

    const slotIds = slots.map(s => s._id);
    const toDeleteSlots = oldPosSlots.filter(s => !slotIds.includes(s._id));
    await models.PosSlots.deleteMany({
      _id: { $in: toDeleteSlots.map(s => s._id) }
    });

    const updateSlots = slots.filter(s => s._id);
    const bulkOps: {
      updateOne: {
        filter: { _id: string };
        update: any;
        upsert: true;
      };
    }[] = [];

    for (const slot of updateSlots) {
      bulkOps.push({
        updateOne: {
          filter: { _id: slot._id || '' },
          update: { $set: { ...slot } },
          upsert: true
        }
      });
    }

    await models.PosSlots.bulkWrite(bulkOps);

    await models.PosSlots.insertMany(slots.filter(s => !s._id));

    const updatedSlots = await models.PosSlots.find({ posId });
    const { ALL_AUTO_INIT } = process.env;

    if (
      [true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '') ||
      pos.isOnline
    ) {
      await syncSlotsToClient(subdomain, pos, updatedSlots);
    }

    return updatedSlots;
  },

  posOrderSyncErkhet: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext
  ) => {
    const order = await models.PosOrders.findOne({ _id }).lean();
    if (!order) {
      throw new Error('not found order');
    }
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();

    const putRes = await sendEbarimtMessage({
      subdomain,
      action: 'putresponses.putHistories',
      data: {
        contentType: 'pos',
        contentId: _id
      },
      isRPC: true
    });

    if (!pos) {
      throw new Error('not found pos');
    }
    if (!putRes) {
      throw new Error('not found put response');
    }
    await orderToErkhet(models, messageBroker, subdomain, pos, _id, putRes);
    return await models.PosOrders.findOne({ _id }).lean();
  },

  posOrderReturnBill: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext
  ) => {
    const order = await models.PosOrders.findOne({ _id }).lean();
    if (!order) {
      throw new Error('not found order');
    }
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    if (!pos) {
      throw new Error('not found pos');
    }
    const ebarimtMainConfig = await getConfig(subdomain, 'EBARIMT', {});

    await sendEbarimtMessage({
      subdomain,
      action: 'putresponses.returnBill',
      data: {
        contentType: 'pos',
        contentId: _id,
        config: { ...pos.ebarimtConfig, ...ebarimtMainConfig }
      },
      isRPC: true
    });

    if (order.syncedErkhet) {
      await orderDeleteToErkhet(models, messageBroker, subdomain, pos, _id);
    }
    return await models.PosOrders.deleteOne({ _id });
  },
  posOrderChangePayments: async (
    _root,
    { _id, cashAmount, cardAmount, mobileAmount },
    { models }
  ) => {
    const order = await models.PosOrders.findOne({ _id }).lean();
    if (!order) {
      throw new Error('not found order');
    }

    if (order.totalAmount !== cashAmount + cardAmount + mobileAmount) {
      throw new Error('not balanced');
    }

    await models.PosOrders.updateOne(
      { _id },
      { $set: { cashAmount, cardAmount, mobileAmount } }
    );
    return models.PosOrders.findOne({ _id }).lean();
  }
};

checkPermission(mutations, 'posAdd', 'managePos');
checkPermission(mutations, 'posEdit', 'managePos');
checkPermission(mutations, 'posRemove', 'managePos');

export default mutations;
