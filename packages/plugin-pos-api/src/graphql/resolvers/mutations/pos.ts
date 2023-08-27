import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { IPos, IPosSlot } from '../../../models/definitions/pos';
import {
  syncPosToClient,
  syncProductGroupsToClient,
  syncRemovePosToClient,
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
    const { ALL_AUTO_INIT } = process.env;
    if ([true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '')) {
      params.onServer = true;
    }
    const pos = await models.Pos.posAdd(user, params);

    if (pos.onServer) {
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

    const { ALL_AUTO_INIT } = process.env;
    if ([true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '')) {
      doc.isOnline = true;
    }

    const updatedDocument = await models.Pos.posEdit(_id, { ...doc });

    await syncPosToClient(subdomain, updatedDocument);

    return updatedDocument;
  },

  posRemove: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain }: IContext
  ) => {
    const pos = await models.Pos.getPos({ _id });
    await syncRemovePosToClient(subdomain, pos);
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

    await syncProductGroupsToClient(subdomain, models, pos);

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

    if (bulkOps && bulkOps.length) {
      await models.PosSlots.bulkWrite(bulkOps);
    }

    await models.PosSlots.insertMany(slots.filter(s => !s._id));

    const updatedSlots = await models.PosSlots.find({ posId });

    await syncSlotsToClient(subdomain, pos, updatedSlots);

    return updatedSlots;
  }
};

checkPermission(mutations, 'posAdd', 'managePos');
checkPermission(mutations, 'posEdit', 'managePos');
checkPermission(mutations, 'posRemove', 'managePos');

export default mutations;
