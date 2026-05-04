import { IContext } from '~/connectionResolvers';
import { IPosSlot } from '~/modules/pos/@types/orders';
import { IPos } from '~/modules/pos/@types/pos';
import {
  syncPosToClient,
  syncProductGroupsToClient,
  syncRemovePosToClient,
  syncSlotsToClient,
} from './utils';

const posMutations = {
  posAdd: async (
    _root,
    params: IPos,
    { models, user, subdomain, checkPermission }: IContext,  // ← add checkPermission
  ) => {
    await checkPermission('posAdd');                          // ← permission check
    const { ALLOW_OFFLINE_POS } = process.env;
    if (![true, 'true', 'True', 1, '1'].includes(ALLOW_OFFLINE_POS || '')) {
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
    { _id, ...doc }: IPos & { _id: string },
    { models, subdomain, checkPermission }: IContext,  // ← add checkPermission
  ) => {
    await checkPermission('posEdit');                    // ← permission check

    await models.Pos.getPos({ _id });

    const { ALLOW_OFFLINE_POS } = process.env;
    if (![true, 'true', 'True', 1, '1'].includes(ALLOW_OFFLINE_POS || '')) {
      doc.onServer = true;
    }

    const updatedDocument = await models.Pos.posEdit(_id, { ...doc });

    await syncPosToClient(subdomain, updatedDocument);

    return updatedDocument;
  },

  posRemove: async (
    _root,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,  // ← add checkPermission
  ) => {
    await checkPermission('posRemove');                  // ← permission check

    const pos = await models.Pos.getPos({ _id });
    await syncRemovePosToClient(subdomain, pos);
    return await models.Pos.posRemove(_id);
  },

  productGroupsBulkInsert: async (
    _root,
    { posId, groups }: { posId: string; groups: any[] },
    { models, subdomain, checkPermission }: IContext,  // ← add checkPermission
  ) => {
    await checkPermission('productGroupsBulkInsert');    // ← permission check

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
    const groupsToRemove = dbGroups.filter((el) => {
      const index = groupsToUpdate.findIndex((g) => g._id === el._id);
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
    { models, subdomain, checkPermission }: IContext,  // ← add checkPermission
  ) => {
    await checkPermission('posSlotBulkUpdate');          // ← permission check

    const pos = await models.Pos.getPos({ _id: posId });

    const oldPosSlots = await models.PosSlots.find({ posId });

    const slotIds = slots.map((s) => s._id);
    const toDeleteSlots = oldPosSlots.filter((s) => !slotIds.includes(s._id));
    await models.PosSlots.deleteMany({
      _id: { $in: toDeleteSlots.map((s) => s._id) },
    });

    const updateSlots = slots.filter((s) => s._id);
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
          upsert: true,
        },
      });
    }

    if (bulkOps?.length) {
      await models.PosSlots.bulkWrite(bulkOps);
    }

    await models.PosSlots.insertMany(slots.filter((s) => !s._id));

    const updatedSlots = await models.PosSlots.find({ posId });

    await syncSlotsToClient(subdomain, pos, updatedSlots);

    return updatedSlots;
  },
};

export default posMutations;
