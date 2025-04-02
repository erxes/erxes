import { checkPermission } from '@erxes/api-utils/src/permissions';
import * as lodash from "lodash";
import {
  IAccount,
  IAccountDocument,
} from '../../../models/definitions/account';
import {
  putCreateLog,
  putDeleteLog,
  putUpdateLog,
  MODULE_NAMES,
} from '../../../logUtils';
import { IContext } from '../../../connectionResolver';
import { ADJ_INV_STATUSES, IAdjustInventory } from '../../../models/definitions/adjustInventory';
import { sendCoreMessage } from '../../../messageBroker';

const adjustInventoryMutations = {
  async adjustInventoryAdd(
    _root,
    doc: IAdjustInventory,
    { user, docModifier, models }: IContext
  ) {
    const adjusting = await models.AdjustInventories.createAdjustInventory(docModifier({ ...doc, createBy: user._id }));

    return adjusting;
  },

  async adjustInventoryCheck(_root, { _id }: { _id: string }, { models }: IContext) {
    const adjusting = await models.AdjustInventories.getAdjustInventory(_id);
    if (adjusting.status === ADJ_INV_STATUSES.PUBLISH) {
      throw new Error('this adjusting is published');
    }

    const filter = {
      branchId: adjusting.branchId,
      departmentId: adjusting.departmentId,
    };

    const preAdjusting = await models.AdjustInventories.findOne({
      ...filter,
      accountId: adjusting.accountId,
    }).sort({ date: -1 });

    const trFilters: any = {
      'details.accountId': adjusting.accountId,
      'details.productId': { $exists: true, $ne: '' },
      ...filter,
    };

    if (preAdjusting) {
      trFilters.date = { $gt: preAdjusting.date }
    }

    const records = await models.Transactions.aggregate([
      { $match: trFilters },
      { $unwind: '$details' },
      { $addFields: { detail: '$details' } },
      { $project: { 'details': 0 } },
      {
        $group: {
          _id: '$detail.productId',
          records: { $push: '$$ROOT' }
        }
      }
    ]);

    const preRecords = preAdjusting?.details || [];

    const productsIds = records.map(r => r._id);
    lodash.difference(productsIds, preAdjusting?.productIds || [])
    

    // productId: string;
    // remainder: number;
    // cost: number;
    // unitCost: number;
    // soonInCount: number;
    // soonOutCount: number;


  },

  async adjustInventoryPublish(_root, { _id }: { _id: string }, { models }: IContext) {
    const adjusting = await models.AdjustInventories.getAdjustInventory(_id);
    if (adjusting.status === ADJ_INV_STATUSES.PUBLISH) {
      throw new Error('this adjusting is published');
    }
  },

  async adjustInventoryCancel(_root, { _id }: { _id: string }, { models }: IContext) {
    const adjusting = await models.AdjustInventories.getAdjustInventory(_id);
    if (adjusting.status === ADJ_INV_STATUSES.PUBLISH) {
      throw new Error('this adjusting is published');
    }
  },

  async adjustInventoryRemove(_root, { _id }: { _id: string }, { models }: IContext) {
    const adjusting = await models.AdjustInventories.getAdjustInventory(_id);
    if (adjusting.status === ADJ_INV_STATUSES.PUBLISH) {
      throw new Error('this adjusting is published');
    }
  },
};

export default adjustInventoryMutations;
